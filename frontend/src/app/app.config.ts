import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { environment } from '../environments/environment';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  ArrowLeftOutline,
  CheckCircleOutline,
  CloseOutline,
  CopyOutline,
  EyeOutline,
  InfoCircleOutline,
  LoadingOutline,
  LoginOutline,
  PlusCircleOutline,
  PlusOutline,
  QuestionCircleOutline,
  SearchOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

Amplify.configure({
  API: {
    Events: {
      endpoint: `https://${environment.appSyncEndpoint}/event`,
      region: environment.appSyncRegion,
      defaultAuthMode: 'apiKey',
      apiKey: environment.appSyncApiKey,
    },
  },
});

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNzI18n(en_US),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideNzIcons([
      PlusCircleOutline,
      LoginOutline,
      SearchOutline,
      CheckCircleOutline,
      EyeOutline,
      CopyOutline,
      QuestionCircleOutline,
      CloseOutline,
      PlusOutline,
      ArrowLeftOutline,
      LoadingOutline,
      InfoCircleOutline,
      UserOutline,
    ]),
  ],
};
