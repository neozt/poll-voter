import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
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
  InfoCircleOutline
} from '@ant-design/icons-angular/icons';

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
      InfoCircleOutline
    ])
  ],
};
