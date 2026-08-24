import { Component, inject } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-language-changer',
  standalone: true,
  imports: [SelectModule, FormsModule, TranslocoModule],
  templateUrl: './language-changer.component.html',
  styleUrl: './language-changer.component.scss',
})
export class LanguageChangerComponent {
  constructor(private transloco: TranslocoService) {}
  countries: any[] | undefined;
  selectedCountry = { name: 'Jap', code: 'JP' };
  private layoutState = inject(LayoutService);
  isMobile = this.layoutState.isMobile;

  ngOnInit() {
    this.countries = [
      { name: 'US', code: 'US' },
      { name: 'Rus', code: 'RU' },
      { name: 'Jap', code: 'JP' },
      { name: 'Uzb', code: 'UZ' },
    ];
  }

  changeLang(lang: string) {
    this.transloco.setActiveLang(lang);
  }
}
