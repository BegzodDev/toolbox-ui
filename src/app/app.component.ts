import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageChangerComponent } from './components/language-changer/language-changer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LayoutService } from './core/services/layout.service';
import { TopbarComponent } from './components/topbar/topbar.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    LanguageChangerComponent,
    SidebarComponent,
    TopbarComponent,
    TranslocoModule,
  ],
})
export class AppComponent {
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
    // {
    //   label: 'tools.seat_generator',
    //   ext: 'seat_gen.tsx',
    //   route: '/seat-generator',
    // },
    // {
    //   label: 'tools.furigana_reader',
    //   ext: 'furigana.log',
    //   route: '/furigana-reader',
    // },
    // {
    //   label: 'tools.time_tracker',
    //   ext: 'time_tracker.ts',
    //   route: '/time-tracker',
    // },
  ];
  title = 'toolbox-ui';

  private layoutState = inject(LayoutService);
  isMobile = this.layoutState.isMobile;
  activeSection = signal('about');

  setActiveSection(section: string): void {
    this.activeSection.set(section);
  }
}

interface NavItem {
  label: string;
  ext: string;
  route: string;
}
