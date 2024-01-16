import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import Tracker from '@openreplay/tracker';
import { inject } from '@angular/core';
import { StorageApi } from './app/services/storage-api.service';
import { environment } from './environments/environment.development';

bootstrapApplication(AppComponent, appConfig)
  .then((ref) => new Tracker({ projectKey: "LZtkmHfnErC4rxd5KFq1" }).start())
  .catch((err) => console.error(err));

(() => {
  var console_ = console;
  var date = new Date();
        
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  
  console_.log("Logger initialized")
  const logger = (content:any) => {

    fetch(`${environment.apiUrl}api/log`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({content: JSON.stringify(content), path: `logger_${date.toISOString().replaceAll(":", "_")}`})
    })
  }

  var pack = {
    add(content: any) {
      pack.items.push(content)
      if (pack.items.length > 10) {
        logger(pack.items)
        pack.items = []
      }
    }, 
    items: [] as string[]
  };

  if (environment.production) {
    console_.log = (x) => pack.add(x),
    console_.warn = (x) => pack.add(x),
    console_.error = (x) => pack.add(x),
    console_.info = (x) => pack.add(x)
  }


})()