import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment.development';

Number.prototype.fileSize = function(this, a,b,c,d){
  return (
    a = a
      ? [1e3,'k','B']
      : [1024,'K','iB'],
      b=Math,
      c=b.log,
      d=c(this)/c(a[0])|0,
      // @ts-ignore
      this/b.pow(a[0],d)).toFixed(2) +' ' + (d? (a[1]+'MGTPEZY')[--d]+a[2] : 'Bytes'
  );
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
