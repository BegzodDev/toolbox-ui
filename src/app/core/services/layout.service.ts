import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly platformId = inject(PLATFORM_ID);

  private mediaQuery: MediaQueryList | null = null;

  isMobile = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.mediaQuery = window.matchMedia('(max-width: 768px)');

      this.isMobile.set(this.mediaQuery.matches);

      this.mediaQuery.addEventListener('change', (event) => {
        this.isMobile.set(event.matches);
      });
    }
  }
}
