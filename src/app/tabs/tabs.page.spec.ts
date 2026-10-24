import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the tab bar without a competing router outlet', () => {
    const tabs = fixture.nativeElement.querySelector('ion-tabs');
    const tabButtons = fixture.nativeElement.querySelectorAll('ion-tab-button');
    const routerOutlet = fixture.nativeElement.querySelector('ion-router-outlet');

    expect(tabs).not.toBeNull();
    expect(routerOutlet).toBeNull();
    expect(tabButtons.length).toBeGreaterThanOrEqual(4);
  });
});
