import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from "@angular/core";
import { FileService } from "../services/file.service";

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
              <div class="w-full max-h-[80vh] rounded-b-md bg-slate-400 overflow-y-auto">
                <pre class="p-2 text-sm whitespace-pre-wrap">{{fileContent}}</pre>
              </div>
            } @else if (isRenderable(src!)) {
              <div class="w-full max-h-[80vh] rounded-b-md bg-slate-400 overflow-y-auto">
                <div class="p-2 text-sm whitespace-pre-wrap" [innerHTML]="fileContent"></div>
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
      
      this.src = encodeURI(this.src!);
      await this.checkFileExtension(this.src!);
      
      this.visible = this.src != '';
    }

    @Input() 
    get visible() { return this._visible; }
    set visible(value: boolean) { this._visible = value; }
    
    @Input() src?: string; 
    @Output() close = new EventEmitter<void>();
    private fileService = inject(FileService);

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
      return new Promise(async (resolve, reject) => {
        if (this.isImage(value)) {
          return resolve(true);
        } else if (this.isText(value) || this.isRenderable(value)) {
          this.fileContent = await this.fileService.readFile(value) as string;
          
        }

        return resolve(true);
      });
    }

    download() {
      this.fileService.download(this.src!, false);
    }

    close_() {
      this.visible = false;
      this.close.emit();
    }

}
