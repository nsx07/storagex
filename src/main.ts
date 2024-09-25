import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { injectSpeedInsights } from '@vercel/speed-insights/*';
import { enableProdMode } from '@angular/core';
import { inject } from '@vercel/analytics/*';

Number.prototype.fileSize = function (this, a, b, c, d) {
  return (
    ((a = a ? [1e3, 'k', 'B'] : [1024, 'K', 'iB']),
    (b = Math),
    (c = b.log),
    (d = (c(this) / c(a[0])) | 0),
    // @ts-ignore
    this / b.pow(a[0], d)).toFixed(2) +
    ' ' +
    (d ? (a[1] + 'MGTPEZY')[--d] + a[2] : 'Bytes')
  );
};

if (environment.production) {
  injectSpeedInsights();
  enableProdMode();
  inject();
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
