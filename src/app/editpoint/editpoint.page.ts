import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import * as L from 'leaflet';
import { DataService } from '../data.service';

const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
const iconUrl = 'assets/images/marker-icon.png';
const shadowUrl = 'assets/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: false,
})
export class EditpointPage implements OnInit, OnDestroy {
  map!: L.Map;
  key = '';
  name = '';
  coordinates = '';
  description = '';
  private pointCoordinates: L.LatLngExpression = [-7.7956, 110.3695];
  private viewEntered = false;
  private pointLoaded = false;

  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  async ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') || '';

    try {
      const point = await this.dataService.getPoint(this.key);
      if (!point) {
        throw new Error('The requested point could not be found.');
      }

      this.name = point.name;
      this.coordinates = point.coordinates;
      this.description = point.description ?? '';
      const coordinates = point.coordinates.split(',').map(Number);
      if (
        coordinates.length !== 2 ||
        !Number.isFinite(coordinates[0]) ||
        !Number.isFinite(coordinates[1])
      ) {
        throw new Error('The point has invalid coordinates.');
      }
      this.pointCoordinates = [coordinates[0], coordinates[1]];
      this.pointLoaded = true;
      this.initializeMapWhenReady()
      ;
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Load Failed',
        message: error instanceof Error ? error.message : 'Unable to load point.',
        buttons: ['OK'],
      });
      await alert.present();
      this.navCtrl.back();
    }
  }

  ionViewDidEnter() {
    this.viewEntered = true;
    this.initializeMapWhenReady();
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  async save() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.updatePoint(this.key, {
          name: this.name,
          coordinates: this.coordinates,
          description: this.description
        });
        this.navCtrl.back();
      } catch (error) {
        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error instanceof Error ? error.message : 'Unable to save point.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }

  private initMap() {
    const mapContainer = document.getElementById('mapedit');
    if (!mapContainer || (mapContainer as HTMLElement & { _leaflet_id?: number })._leaflet_id) {
      return;
    }

    this.map = L.map('mapedit').setView(this.pointCoordinates, 13);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'ESRI'
    });

    osm.addTo(this.map);
    L.control.layers({
      'OpenStreetMap': osm,
      'Esri World Imagery': esri
    }).addTo(this.map);

    const marker = L.marker(this.pointCoordinates, { draggable: true }).addTo(this.map);
    marker.bindPopup('Drag the marker or move the map<br>to change the coordinates<br>of the location');
    marker.openPopup();
    marker.on('dragend', () => {
      const latLng = marker.getLatLng();
      this.coordinates = `${latLng.lat.toFixed(9)},${latLng.lng.toFixed(9)}`;
    });
  }

  private initializeMapWhenReady() {
    if (!this.viewEntered || !this.pointLoaded) {
      return;
    }

    requestAnimationFrame(() => {
      if (this.map) {
        this.map.invalidateSize();
      } else {
        this.initMap();
      }
    });
  }
}
