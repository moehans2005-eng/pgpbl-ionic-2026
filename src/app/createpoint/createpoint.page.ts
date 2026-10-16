import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';

import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';
const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
const iconUrl = 'assets/images/marker-icon.png';
const shadowUrl = 'assets/images/marker-shadow.png';
const iconDefault = icon({
iconRetinaUrl,
iconUrl,
shadowUrl,
iconSize: [25, 41],
iconAnchor: [12, 41],
popupAnchor: [1, -34],
tooltipAnchor: [16, -28],
shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit, OnDestroy {
name = '';
coordinates = '';
description = '';
map!: L.Map;

async save() {
  if (this.name && this.coordinates) {
try {
const pointData = { name: this.name, coordinates: this.coordinates, description: this.description };
//if (this.editMode && this.pointKey) {
//await this.dataService.updatePoint(this.pointKey,pointData);
//} else {
await this.dataService.savePoint(pointData);
//}

this.navCtrl.navigateBack(['/tabs/maps']);

} catch (error: any) {
const alert = await this.alertCtrl.create({
header: 'Save Failed',
message: error.message,
buttons: ['OK'],
});
await alert.present();
}
}

}
private navCtrl = inject(NavController);
private alertCtrl = inject(AlertController);
private dataService = inject(DataService);
  constructor() { }

  ngOnInit() {
    setTimeout(() => this.initMap());
  }

  ionViewDidEnter() {
    requestAnimationFrame(() => {
      this.initMap();
      this.map?.invalidateSize();
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = undefined as any;
    }
  }

  private initMap() {
    const mapContainer = document.getElementById('mapcreate');
    if (!mapContainer || (mapContainer as any)._leaflet_id) {
      if (this.map) {
        this.map.invalidateSize();
      }
      return;
    }

    this.map = L.map('mapcreate').setView([-7.7956, 110.3695], 13);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'ESRI'
    });

    osm.addTo(this.map);

    const baseMaps = {
      'OpenStreetMap': osm,
      'Esri World Imagery': esri
    };

    L.control.layers(baseMaps).addTo(this.map);

    const tooltip = 'Drag the marker or move the map<br>to change the coordinates<br>of the location';
    const marker = L.marker([-7.7956, 110.3695], { draggable: true });
    marker.addTo(this.map);
    marker.bindPopup(tooltip);
    marker.openPopup();

    marker.on('dragend', (e) => {
      const latlng = e.target.getLatLng();
      const lat = latlng.lat.toFixed(9);
      const lng = latlng.lng.toFixed(9);

      this.coordinates = lat + ',' + lng;
      console.log(this.coordinates);
    });
  }
}
