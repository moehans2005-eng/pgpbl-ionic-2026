import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SplashscreenPage } from './splashscreen.page';

describe('SplashscreenPage', () => {
  let component: SplashscreenPage;
  let fixture: ComponentFixture<SplashscreenPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigateByUrl: async () => true } }
      ]
    });
    fixture = TestBed.createComponent(SplashscreenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
