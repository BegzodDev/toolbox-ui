import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './core/services/transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),

    provideAnimationsAsync(),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
        },
      },
    }),

    provideTransloco({
      config: {
        availableLangs: ['us', 'jp', 'ru', 'uz'],
        defaultLang: 'jp',
        fallbackLang: 'jp',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
