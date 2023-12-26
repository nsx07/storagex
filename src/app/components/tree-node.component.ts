import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { DragService } from "../services/drag.service";
import { FileNode } from "../app.component";
import { StorageApi } from "../services/storage-api.service";

@Component({
    imports: [CommonModule],
    selector: 'tree-node',
    standalone: true,
    template: `
        <div class="w-full">
            <!-- <label [for]="'dropzone-file' + uniqueRandom"> 
            <input [id]="'dropzone-file' + uniqueRandom" type="file" class="hidden" max="5" multiple (change)="upload($event)"/> -->
            <div class="p-2 cursor-pointer rounded dark:hover:bg-slate-500 hover:bg-slate-300 w-full" draggable="true" dropzone="true" (dragenter)="interact(item, $event)" (drop)="interact(item, $event)"
                (click)="interact(item, $event)" (dragstart)="interact(item, $event)" (dragend)="interact(item, $event)" (dragover)="interact(item, $event)" (contextmenu)="context($event)">

                <div class="italic w-full rounded-md flex items-center justify-between gap-2 pl-2 text-slate-900 dark:text-slate-200">
                    <div class="wrap">
                        @if (item.type == "file") {
                            <i class="fa-solid fa-file-lines"></i>
                        } @else {
                            <i class="fa-solid" [ngClass]="{'fa-folder': !collapseOpened, 'fa-folder-open': collapseOpened}"></i>
                        }

                        <span class="pl-2 leading-tight font-medium md:text-lg text-md" inert>{{ item.name }}</span>
                    </div>
                    <section class="gap-2 md:flex hidden">
                        <span class="pl-2 leading-tight font-medium text-lg" inert>{{item.size }}</span>
                        <span class="pl-2 leading-tight font-medium text-lg" >{{item.datetime | date: "dd/MM/yy HH:mm"}}</span>
                    </section>
                </div>

            </div>

            @if (item.type == "folder") {
                
                <div class="flex items-center justify-center w-full py-1" *ngIf="dragover">
                    <label [for]="'dropzone-file' + uniqueRandom" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input [id]="'dropzone-file' + uniqueRandom" type="file" class="hidden" max="5" multiple (change)="upload($event)" (drop)="upload($event)"/>
                    </label>
                </div> 

                @if (collapseOpened) {
                    <div class="pl-4">
                        @for (contentItem of item.content; track contentItem.name) {
                            <tree-node [item]="contentItem" (open)="openClick($event)"></tree-node>
                        } @empty {
                            <div class="p-2 text-gray-500 dark:text-gray-400">Empty folder</div>
                        }
                    </div>
                }
            } 

            <div [style.left]="menuTopLeftPosition.x" [style.top]="menuTopLeftPosition.y" *ngIf="contexton"
                class="rounded-md fixed bg-slate-50 shadow-lg w-100 h-20 z-50" >
                context
            </div> 

            <!-- </label> -->
        </div>
    `,
})
export class TreeNodeComponent implements OnInit{

    @Input() item!: FileNode;
    @Output() open = new EventEmitter<FileNode>();

    menuTopLeftPosition =  {x: '0', y: '0'} 

    dragover = false;
    collapseOpened = false;
    uniqueRandom = crypto.randomUUID();

    private dragService = inject(DragService);
    private storageApi = inject(StorageApi);

    ngOnInit(): void {
    }

    upload(event: any) {
        event.preventDefault();
        event.stopPropagation();

        console.log(this.item);
        
        if (event.target.files) {
            const formData = new FormData();

            event.target.files = event.target.files.slice(0, 5);

            for (let i = 0; i < event.target.files.length; i++) {
                formData.append("file", event.target.files[i]);
            }


            this.uploader(formData);

        }
        
    }

    private uploader(formData: FormData) {
        const url = this.item.path.includes("/") ? this.item.path.split("wwwroot")[1].slice(1) : this.item.path;

        const params = {
            projectName: url.split("/")[0],
            projectScope: url.includes("/") ? url.slice(url.indexOf("/")) : url,
        };

        if (params.projectScope == params.projectName) {
            params.projectScope = "";
        }
        
        this.storageApi.post("api/save", formData, params).subscribe(data => {

            if (Array.isArray(data)) {
                data.forEach(x => {
                    this.item.content.push({
                        content: [],
                        size: x.size,
                        type: "file",
                        name: x.fileName,
                        datetime: new Date(),
                        uid: crypto.randomUUID(),
                        path: x.filePath.replace(`\\`, "/"),
                        order: this.item.content.length + 1,
                    })
                });
            }
        });
    }

    interact(item: FileNode, event: DragEvent | MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (event.type == "dragover") {
            this.dragover = true;
            return;
        } else {
            this.dragover = false;
        }
        
        if (event.type == "drop" && 'dataTransfer' in event) {
            
            if (event.dataTransfer?.items) {
                const formData = new FormData();

                for (var i = 0; i < event.dataTransfer.items.length; i++) {

                    if (event.dataTransfer.items[i].kind === "file") {
                        var file = event.dataTransfer.items[i].getAsFile() as File;
                        
                        formData.append("file", file);
                    }
                }

                if (formData.has("file")) {
                    this.uploader(formData);
                }
            }

            return;
        }
        
        if (event instanceof DragEvent) {
            
            if (event.type.toLowerCase() in this.interactHandler)
                this.interactHandler[event.type.toLowerCase()](item)

            return;
        }

        if (item.type == "file") {
            this.openClick(item);
        }
        
        this.collapseOpened = !this.collapseOpened;
    }

    private interactHandler : Record<string, (item: FileNode) => void> = {
        dragstart: item => this.dragService.startDrag(item),
        dragenter: item => this.dragService.setSwapData(item),
        dragend: item => this.dragService.endDrag(item)
    }

    openClick(item: FileNode) {
        this.open.emit(item);
    }

    context(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        console.log("context");

        event.preventDefault(); 
    
        // we record the mouse position in our object 
        this.menuTopLeftPosition.x = event.clientX + 'px'; 
        this.menuTopLeftPosition.y = event.clientY + 'px'; 
        this.contexton = true
        
    
    }

    contexton = false;

}