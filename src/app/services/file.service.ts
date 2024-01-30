import { Injectable } from '@angular/core';
import { StorageApi } from './storage-api.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private storageApi: StorageApi) { }

  download(file: string, isFolder : boolean) {
    if (isFolder) {
      this.downloadZip(file.substring(file.lastIndexOf("wwwroot") + 8));
      return;
    }
    this.downloadFile(file);  
  }

  private downloadZip(folder: string) {
    this.storageApi.get("api/downloadZip", { path: folder }).subscribe({
      next: async (result: any) => {
        
        const file = await fetch("data:image/png;base64," + result.dataZip)
        const blob = new Blob([await file.arrayBuffer()], { type: 'application/zip' })    
        this.createDownload(blob, folder, ".zip");
      },
      error: (error) => {
        console.log(error);
      }
    })
  } 

  private downloadFile(file: string) {
    this.storageApi.getRaw<Blob>(file, { responseType: 'blob' }).subscribe({
      next: (data: any) => {
        const extension = file.split("/").pop()!.split(".")[1];      
        const blob = new Blob([data], { type: 'application/' + extension });
        this.createDownload(blob, file, "." + extension);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  private createDownload(blob: Blob, objectName: string, extension: string) {

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = objectName.split("/").pop()! + extension;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
