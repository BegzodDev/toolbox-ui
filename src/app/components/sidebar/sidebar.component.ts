import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    {
      label: 'sidebar.nav.about',
      ext: 'about.ts',
      href: '#about',
      active: true,
    },
    {
      label: 'sidebar.nav.projects',
      ext: 'projects.tsx',
      href: '#projects',
      active: false,
    },
    {
      label: 'sidebar.nav.experience',
      ext: 'experience.log',
      href: '#contracts',
      active: false,
    },
    {
      label: 'sidebar.nav.contact',
      ext: 'contact.json',
      href: '#contact',
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
