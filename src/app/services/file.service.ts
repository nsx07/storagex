import { Injectable } from '@angular/core';
import { StorageApi } from './storage-api.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private storageApi: StorageApi) { }

  download(file: string) {
    this.storageApi.getRaw<Blob>(file, { responseType: 'blob' }).subscribe({
      next: (data: any) => {
        const extension = file.split("/").pop()!.split(".")[1];      
        const blob = new Blob([data], { type: 'application/' + extension });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        console.log(file.split("/").pop()!);
        
        a.href = url;
        a.download = file.split("/").pop()!;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  readFile(file: string) {
    return new Promise((resolve, reject) => {
      fetch(file)
        .then(async data => {
          let blob = await data.blob();
          let fileReader: FileReader = new FileReader();
          
          fileReader.onloadend = (x) => {
            return resolve(fileReader.result as string);
          }

          fileReader.readAsText(blob);
        })
        .catch(error => {
          console.log(error);
          return resolve(error);
        });
    });
  }

}
