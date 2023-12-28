import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SecurityContext, SimpleChanges, inject } from "@angular/core";
import { StorageApi } from "../services/storage-api.service";
import { HttpEvent } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: 'file-view',
    imports: [CommonModule],
    standalone: true,
    template: `
        <div class="w-full bg-slate-500 rounded-md" *ngIf="_visible">
          <div class="flex justify-between items-center p-2 w-full">
            <h1 *ngIf="src" class="italic text-lg text-ellipsis overflow-hidden font-semibold whitespace-nowrap p-2 dark:text-white" style="direction:rtl;">wwwroot{{src.split("wwwroot")[1]}} </h1>
            <div class="flex items-center gap-2">
              <a class="cursor-pointer px-2" [href]="src" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-up-right-from-square"></i>
              </a>
              <span class="cursor-pointer px-2" (click)="download()">
                <i class="fa-solid fa-cloud-arrow-down"></i>
              </span>
              <span class="cursor-pointer px-2" (click)="close_()">
                <i class="fa-solid fa-circle-xmark fa-xl"></i>
              </span>
            </div>
          </div>
          <div class="w-full">
            @if (isImage(src!)) {
              <div class="w-full max-h-[80vh] rounded-b-md bg-slate-950 overflow-y-auto">
                <img class="w-full h-auto" [src]="src">
              </div>
            } @else if (isText(src!)) {
              <div class="w-full max-h-[80vh] rounded-b-md bg-slate-950 overflow-y-auto">
                <pre class="p-2 text-sm whitespace-pre-wrap">{{fileContent}}</pre>
              </div>
            } @else if (isRenderable(src!)) {
              <div class="w-full max-h-[80vh] rounded-b-md bg-slate-950 overflow-y-auto">
                <div [innerHTML]="fileContent"></div>
              </div>
            } @else if (isVideo(src!)) {
              <div class="w-full max-h-[80vh] rounded-b-md bg-slate-950 overflow-y-auto">
                <video class="w-full h-auto" controls>
                  <source [src]="src" type="video/mp4">
                  <source [src]="src" type="video/ogg">
                  <source [src]="src" type="video/webm">
                  <source [src]="src" type="video/mkv">
                </video>
              </div>
            } @else {
              <div class="w-full h-full bg-slate-200 flex justify-center items-center rounded-b-md">
                <div class="p-2 text-lg text-slate-700 leading-5 font-thin">
                  <i class="fa-regular fa-face-frown-open mr-3"></i>
                  <em>This file extension is not supported yet</em>
                </div>
              </div>
            }
          </div>
        </div>
    `
})
export class FileViewComponent implements OnChanges {
    
    async ngOnChanges(changes: SimpleChanges) {
      console.log(changes);
      
      
      this.src = encodeURI(this.src!);
      await this.checkFileExtension(this.src!);
      
      this.visible = this.src != '';
    }

    @Input() 
    get visible() { return this._visible; }
    set visible(value: boolean) { this._visible = value; }
    
    @Input() src?: string; 
    @Output() close = new EventEmitter<void>();
    private storageApi = inject(StorageApi);
    private sanitize = inject(DomSanitizer);
    
    _visible = false;
    fileContent!: string | ArrayBuffer | null;
    
    isImage(value: string) {
      return value.endsWith(".jpg") || value.endsWith(".png") || value.endsWith(".jpeg") || value.endsWith(".gif");
    }

    isText(value: string) {
      return value.endsWith(".txt") || value.endsWith(".json") || value.endsWith(".xml") || value.endsWith(".css") || value.endsWith(".js");
    }

    isVideo(value: string) {
      return value.endsWith(".mp4") || value.endsWith(".webm") || value.endsWith(".ogg") || value.endsWith(".mkv");
    }

    isRenderable(value: string) {
      return value.endsWith("html");
    }

    checkFileExtension(value: string) {
      return new Promise((resolve, reject) => {
        if (this.isImage(value)) {
          return resolve(true);
        } else if (this.isText(value) || this.isRenderable(value)) {
          return this.uploadFile();
        }

        resolve(true);
      });
    }

    uploadFile() {
      return new Promise((resolve, reject) => {
        fetch(this.src!)
          .then(async data => {
            let blob = await data.blob();
            let fileReader: FileReader = new FileReader();
            
            fileReader.onloadend = (x) => {
              this.fileContent = this.sanitize.sanitize(SecurityContext.HTML, fileReader.result as string);
              console.log(this.fileContent);
              console.log(x.composedPath());
              
              return resolve(true);
            }

            fileReader.readAsText(blob);
          })
          .catch(error => {
            console.log(error);
            return resolve(true);
          });

        
      });
      
    }

    download() {
      this.storageApi.getRaw<Blob>(this.src!, { responseType: 'blob' }).subscribe({
        next: (data: any) => {
          const extension = this.src!.split("/").pop()!.split(".")[1];      const blob = new Blob([data], { type: 'application/' + extension }); // Adjust the content type based on your file type
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          
          console.log(this.src!.split("/").pop()!);
          
          a.href = url;
          a.download = this.src!.split("/").pop()!; // Specify the desired file name
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

    close_() {
      this.visible = false;
      this.close.emit();
    }

}