import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private platformId = inject(PLATFORM_ID);
  private scrollHandler = () => this.onScroll();
  private observer?: IntersectionObserver;

  isScrolled = signal(false);
  mobileOpen = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.initScrollReveal();
      this.initCardGlow();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.observer?.disconnect();
    }
  }

  private onScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  private initScrollReveal(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const items = document.querySelectorAll('.why-item');
    if (!items.length) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' },
    );
    items.forEach((item) => this.observer!.observe(item));
  }

  private initCardGlow(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const cards = document.querySelectorAll<HTMLElement>('.tool-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = card.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
}
