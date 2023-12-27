import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: 'file-view',
    imports: [CommonModule],
    standalone: true,
    template: `
        <div class="h-full w-full bg-slate-500 rounded-md md:block hidden" *ngIf="_visible">
          <div class="flex justify-between items-center p-2">
            <h1 *ngIf="src" class="italic text-lg font-semibold whitespace-nowrap p-2 dark:text-white">wwwroot{{src.split("wwwroot")[1]}} </h1>
            <span class="cursor-pointer px-2" (click)="close_()">
              <i class="fa-regular fa-circle-xmark fa-xl"></i>
            </span>
          </div>
          @if (isImage(src!)) {
            <div class="w-full h-auto bg-white rounded-md">
              <img class="w-full h-auto" [src]="src">
            </div>
          } @else {
            <div class="w-full h-full bg-white rounded-md flex justify-center items-center">
              <div class="p-2 text-xl">
                <i class="fa-regular fa-face-frown-open mr-3"></i>
                This file extension is not supported yet
              </div>
            </div>
          }
        </div>
    `
})
export class FileViewComponent implements OnInit {
    
    ngOnInit(): void {
        this.src = encodeURI(this.src!);
        this.visible = this.src != '';
        console.log(this.src, this.visible);
    }

    @Input() src?: string; 

    @Input() 
    get visible() { return this._visible; }
    set visible(value: boolean) { this._visible = value; }

    @Output() close = new EventEmitter<void>();
    
    _visible = false;
    
    isImage(value: string) {
        return value.endsWith(".jpg") || value.endsWith(".png") || value.endsWith(".jpeg") || value.endsWith(".gif");
    }

    close_() {
        this.visible = false;
        this.close.emit();
    }

}