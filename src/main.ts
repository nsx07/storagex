import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import Tracker from '@openreplay/tracker';

bootstrapApplication(AppComponent, appConfig)
  .then((ref) => new Tracker({ projectKey: "LZtkmHfnErC4rxd5KFq1" }).start())
  .catch((err) => console.error(err));