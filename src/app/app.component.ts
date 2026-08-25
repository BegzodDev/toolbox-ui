import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageChangerComponent } from './components/language-changer/language-changer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LayoutService } from './core/services/layout.service';
import { TopbarComponent } from './components/topbar/topbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    LanguageChangerComponent,
    SidebarComponent,
    TopbarComponent,
  ],
})
export class AppComponent {
  title = 'toolbox-ui';

  private layoutState = inject(LayoutService);
  isMobile = this.layoutState.isMobile;
  activeSection = signal('about');

  setActiveSection(section: string): void {
    this.activeSection.set(section);
  }
}
