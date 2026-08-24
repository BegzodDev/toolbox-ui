import { Component, inject } from '@angular/core';
import { LayoutService } from '../../core/services/layout.service';
import { LanguageChangerComponent } from '../language-changer/language-changer.component';

@Component({
  selector: 'app-topbar',
  imports: [LanguageChangerComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private layoutState = inject(LayoutService);
  isMobile = this.layoutState.isMobile;
}
