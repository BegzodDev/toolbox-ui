import {
  mergeApplicationConfig,
  ApplicationConfig,
  isDevMode,
} from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { provideTransloco } from '@jsverse/transloco';
import { serverRoutes } from './app.routes.server';
import { TranslocoHttpLoader } from './core/services/transloco-loader';
import { provideHttpClient } from '@angular/common/http';

const serverConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    provideTransloco({
      config: {
        availableLangs: ['us', 'jp', 'ru', 'uz'],
        defaultLang: 'jp',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
