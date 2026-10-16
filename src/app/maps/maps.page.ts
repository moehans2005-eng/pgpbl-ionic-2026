import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  constructor() { }

  private dataService = inject(DataService);

  ngOnInit() {
    setTimeout(() => this.initMap());
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

    this.map.invalidateSize();
    this.loadPoints();
  }

  async loadPoints() {
    if (!this.map) {
      return;
    }

    const points: Record<string, any> = await this.dataService.getPoints() ?? {};

    for (const key in points) {
      if (Object.prototype.hasOwnProperty.call(points, key)) {
        const point = points[key];
        const coordinates = point?.coordinates
          ?.split(',')
          .map((c: string) => parseFloat(c)) ?? [];

        if (coordinates.length === 2 && Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1])) {
          const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.map);
          marker.bindPopup(`${point.name}`);
        }
      }
    }
  }
}
