// Import zone.js (required for Angular change detection)
import 'zone.js';  

import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http'; // ✅ import this
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Add withFetch to your providers
const updatedAppConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withFetch()) // ✅ enable fetch
  ]
};

// Bootstrap the main App component
bootstrapApplication(App, updatedAppConfig)
  .catch((err) => console.error(err));
