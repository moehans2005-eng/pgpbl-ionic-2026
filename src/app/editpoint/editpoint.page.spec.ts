import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { DataService } from '../data.service';
import { EditpointPage } from './editpoint.page';

describe('EditpointPage', () => {
  let component: EditpointPage;
  let fixture: ComponentFixture<EditpointPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, IonicModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'point-key' } } }
        },
        {
          provide: AlertController,
          useValue: { create: async () => ({ present: async () => undefined }) }
        },
        { provide: NavController, useValue: { back: () => undefined } },
        {
          provide: DataService,
          useValue: {
            getPoint: async () => ({ name: 'Test point', coordinates: '-7.7956,110.3695' }),
            updatePoint: async () => undefined
          }
        }
      ]
    });
    fixture = TestBed.createComponent(EditpointPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
