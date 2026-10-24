import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
  standalone: false,
})
export class SplashscreenPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private redirectTimer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.redirectTimer = setTimeout(() => {
      void this.router.navigateByUrl('/login');
    }, 2000);
  }

  ngOnDestroy() {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }

}
