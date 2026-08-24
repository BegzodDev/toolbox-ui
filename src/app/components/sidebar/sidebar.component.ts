import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    {
      label: 'tools.calculator_home_price',
      ext: 'calculate.ts',
      href: '#calculator',
      active: true,
    },
    {
      label: 'tools.seat_generator',
      ext: 'seat_gen.tsx',
      href: '#seat-generator',
      active: false,
    },
    {
      label: 'tools.furigana_reader',
      ext: 'furigana.log',
      href: '#furigana-reader',
      active: false,
    },
    {
      label: 'tools.time_tracker',
      ext: 'time_tracker.ts',
      href: '#time-tracker',
      active: false,
    },
  ];
}

interface NavItem {
  label: string;
  ext: string;
  href: string;
  active: boolean;
}
