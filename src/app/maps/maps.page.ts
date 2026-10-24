import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { DataService } from '../data.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})

export class MapsPage implements OnInit, OnDestroy {
  map!: L.Map;
  private pointsLayer?: L.LayerGroup;
  constructor() { }

  private dataService = inject(DataService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  ngOnInit() {
    setTimeout(() => this.initMap());
  }

  ionViewWillEnter() {
    if (this.map) {
      void this.loadPoints();
    }
  }

  async deletePoint(key: string) {
    try {
      await this.dataService.deletePoint(key);
      await this.loadPoints();
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Unable to delete point.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = undefined as any;
    }
  }

  private initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || (mapContainer as any)._leaflet_id) {
      if (this.map) {
        this.map.invalidateSize();
      }
      return;
    }

    this.map = L.map('map', {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true
    }).setView([-7.7956, 110.3695], 13);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'ESRI'
    });

    osm.addTo(this.map);
    L.control.layers({
      'OpenStreetMap': osm,
      'Esri World Imagery': esri
    }).addTo(this.map);

    this.pointsLayer = L.layerGroup().addTo(this.map);
    this.map.invalidateSize();
    void this.loadPoints();
  }

  async loadPoints() {
    if (!this.map || !this.pointsLayer) {
      return;
    }

    try {
      const points: Record<string, any> = await this.dataService.getPoints() ?? {};
      this.pointsLayer.clearLayers();

      for (const key in points) {
        if (Object.prototype.hasOwnProperty.call(points, key)) {
          const point = points[key];
          const coordinates = point?.coordinates
            ?.split(',')
            .map((c: string) => parseFloat(c)) ?? [];

          if (coordinates.length === 2 && Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1])) {
            const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.pointsLayer);
            const popupContent = document.createElement('div');
            popupContent.className = 'point-popup';
            const name = document.createElement('div');
            name.textContent = String(point.name ?? '');

            const actions = document.createElement('div');
            actions.className = 'point-popup-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'edit-button';
            editButton.setAttribute('aria-label', 'Edit point');
            const editIcon = document.createElement('img');
            editIcon.src = 'assets/icon/edit.png';
            editIcon.alt = '';
            editIcon.width = 18;
            editIcon.height = 18;
            editIcon.style.verticalAlign = 'middle';
            editButton.append(editIcon, document.createTextNode(' Edit'));

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'delete-button';
            deleteButton.setAttribute('aria-label', 'Delete point');
            const deleteIcon = document.createElement('img');
            deleteIcon.src = 'assets/icon/delete.png';
            deleteIcon.alt = '';
            deleteIcon.width = 18;
            deleteIcon.height = 18;
            deleteIcon.style.verticalAlign = 'middle';
            deleteButton.append(deleteIcon, document.createTextNode(' Delete'));

            actions.append(editButton, deleteButton);
            popupContent.append(name, actions);
            marker.bindPopup(popupContent);
            marker.on('popupopen', (event) => {
              const popup = event.popup.getElement();
              const editAction = popup?.querySelector<HTMLButtonElement>('.edit-button');
              const deleteAction = popup?.querySelector<HTMLButtonElement>('.delete-button');

              if (editAction) {
                editAction.onclick = (clickEvent) => {
                  clickEvent.preventDefault();
                  clickEvent.stopPropagation();
                  void this.openEditPoint(key);
                };
              }

              if (deleteAction) {
                deleteAction.onclick = () => {
                  void this.deletePoint(key);
                };
              }
            });
          }
        }
      }
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Load Failed',
        message: error instanceof Error ? error.message : 'Unable to load points.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  private async openEditPoint(key: string) {
    try {
      const navigated = await this.router.navigate(['/editpoint', key]);
      if (!navigated) {
        throw new Error('Could not open the edit page.');
      }
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Edit Failed',
        message: error instanceof Error ? error.message : 'Unable to open point for editing.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
