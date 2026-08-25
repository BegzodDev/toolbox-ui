import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    {
      label: 'tools.home',
      ext: 'index.ts',
      route: '/',
    },
    {
      label: 'tools.calculator',
      ext: 'calculate.ts',
      route: '/calculator',
    },
    {
      label: 'tools.seat_generator',
      ext: 'seat_gen.tsx',
      route: '/seat-generator',
    },
    {
      label: 'tools.furigana_reader',
      ext: 'furigana.log',
      route: '/furigana-reader',
    },
    {
      label: 'tools.time_tracker',
      ext: 'time_tracker.ts',
      route: '/time-tracker',
    },
  ];
}

interface NavItem {
  label: string;
  ext: string;
  route: string;
}
