import { CommonModule, DOCUMENT } from "@angular/common";
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from "@angular/core";
import { DragService } from "../services/drag.service";
import { FileNode } from "../app.component";
import { StorageApi } from "../services/storage-api.service";
import { ContextItem, ContextMenuComponent } from "./context-menu.component";
import { getUrlParsed } from "../utils/helper-url";
import { FormsModule } from "@angular/forms";
import { getFileIcon } from "../utils/fileicon-type";

@Component({
    imports: [CommonModule, ContextMenuComponent, FormsModule],
    selector: 'tree-node',
    standalone: true,
    template: `
        <div class="w-full" draggable="true" dropzone="true" (dragover)="interact(item, $event)" (drop)="interact(item, $event)" (dragleave)="dragover = false">
            <context-menu [items]="contextItens">  
                <div class="cursor-pointer rounded dark:hover:bg-slate-500 hover:bg-slate-300 w-full" (dragenter)="interact(item, $event)" 
                    (dragstart)="interact(item, $event)" (dragend)="interact(item, $event)">

                        <div class="italic w-full rounded-md flex items-center justify-between gap-2 p-2 text-slate-900 dark:text-slate-200">
                            <div class="flex gap-4 items-center" (click)="interact(item, $event)">
                                @if (item.type == "file") {
                                    <!-- <i class="fa-solid fa-file-lines"></i> -->
                                    <img [src]="icon" width="20" height="auto" alt="icon-file-type">
                                } @else {
                                    <i class="fa-solid" [ngClass]="{'fa-folder': !collapseOpened, 'fa-folder-open': collapseOpened}"></i>
                                }
                                <span class="relative flex w-max items-center rounded-lg dark:text-slate-200 text-slate-500" [ngClass]="{'border-2 dark:border-slate-300 border-slate-600 z-10 px-2 py-1': rename}">
                                    <input type="text" [disabled]="!rename" [(ngModel)]="item.name" (keyup)="changeName($event)" [ngClass]="{'dark:text-slate-300 text-slate-600 z-10': rename, 'z-0': !rename}"
                                        class="resize-none flex-1 w-44 text-ellipsis overflow-hidden border text-base focus:outline-none bg-transparent appearance-none border-transparent focus:border-transparent"
                                    />

                                    <div class="rounded-lg right-1 cursor-pointer dark:text-slate-400 text-slate-700" *ngIf="rename" (click)="changeName(undefined, true)">
                                        <i class="fa-solid fa-circle-check fa-lg"></i>
                                    </div>  

                                </span>
                            </div>

                            <section class="md:hidden block z-20">
                                <context-menu [items]="contextItens" [forMobile]="true">
                                    <div class="p-2 flex items-center">
                                        <i class="fa-solid fa-ellipsis-vertical"></i>
                                    </div>
                                </context-menu>
                            </section>
                            <section class="gap-2 md:flex hidden">
                                <span class="pl-2 leading-tight font-medium text-lg">{{item.size ? (item.size).fileSize() : item.size }}</span>
                                <span class="pl-2 leading-tight font-medium text-lg">{{item.datetime | date: "dd/MM/yy HH:mm"}}</span>
                            </section>
                        </div>
                        
                </div>
            </context-menu>

            @if (item.type == "folder") {
                
                <div class="flex items-center justify-center w-full py-1 relative" [ngClass]="{'hidden': !dragover}">
                    <div class="absolute top-2 right-2 rounded-md">
                        <span class="cursor-pointer text-gray-500 dark:text-gray-400 dark:hover:text-slate-200 hover:text-slate-800" (click)="dragover = false">
                            <i class="fa-solid fa-xmark fa-lg"></i>
                        </span>
                    </div>
                    <label [for]="uniqueRandom" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                            <svg class="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="mb-2 text-sm"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                        <input [id]="uniqueRandom" type="file" class="invisible" max="5" multiple (change)="upload($event)"/>
                    </label>
                </div> 

                @if (collapseOpened) {
                    <div class="pl-4">
                        @for (contentItem of item.content; track contentItem.name) {
                            <tree-node [item]="contentItem" (open)="openClick($event)" (delete)="this.commandHandler.delete($event)"></tree-node>
                        } @empty {
                            <div class="p-2 text-gray-500 dark:text-gray-400">Empty folder</div>
                        }
                    </div>
                }

            } 

        </div>
    `,
})
export class TreeNodeComponent implements OnInit {
    
    ngOnInit(): void {
        this.contextItens = [
            {type: "folder", name: "Upload", icon: "fa-solid fa-upload", command: () => this.commandHandler.newFile()},
            {type: "folder", name: "New file", icon: "fa-solid fa-plus", command: () => this.commandHandler.newFile(), disabled: true},
            {type: "folder", name: "New folder", icon: "fa-solid fa-folder-plus", command: () => this.commandHandler.newFolder()},
            {type: "folder", separator: true},
            {type: "file", name: "Open", icon: "fa-solid fa-folder-open", command: () => this.openClick(this.item), checkDisabled: () => this.item.type == "folder"},
            {type: "*", name: "Rename", icon: "fa-solid fa-pencil", command: () => this.commandHandler.rename()},
            {type: "*", separator: true},
            {type: "*", name: "Delete", icon: "fa-solid fa-trash", command: () => this.commandHandler.delete(this.item)},
        ].filter(x => x.type == "*" || x.type == this.item.type);
        
        this.getIcon();

        this.oldName = this.item.name;
    }

    @Input() item!: FileNode;
    @Output() open = new EventEmitter<FileNode>();
    @Output() delete = new EventEmitter<FileNode>();

    public icon?: string;
    private oldName = "";
    public rename = false;
    public dragover = false;
    public collapseOpened = false;
    public contextItens: ContextItem[] = [];
    public uniqueRandom = crypto.randomUUID();

    private storageApi = inject(StorageApi);
    private dragService = inject(DragService);

    public upload(event: any) {
        event.preventDefault();
        event.stopPropagation();

        console.log(event.target.files);
        
        if (event.target.files) {
            const formData = new FormData();

            for (let i = 0; i < event.target.files.length || i == 5; i++) {
                formData.append("file", event.target.files[i]);
            }

            this.uploader(formData);

        }
        
    }

    private getIcon() {
        if (this.item.type == "folder") 
            return;

        this.icon = getFileIcon(this.item.name.split(".")[1]);
    }

    public interact(item: FileNode, event: DragEvent | MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        console.log(event);
        

        if (event.type == "dragover") {
            this.dragover = true;
            return;
        } else this.dragover = false;
        
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

    public openClick(item: FileNode) {
        this.open.emit(item);
    }

    public changeName(event?: KeyboardEvent, save: boolean = false) {
        if (event?.key == "Enter" || save) {
            this.rename = false;
            
            let path = this.item.path.replace(this.oldName, this.item.name);
            console.log(this.item.path, path);
            (this.oldName !== this.item.name) && this.storageApi.patch("api/rename", {newPath: path, oldPath: this.item.path}).subscribe({
                next: () => {
                    this.item.path = path;
                    this.oldName = this.item.name;
                },
                error: (err) => {
                    this.item.name = this.oldName;
                    console.log(err)
                }
            });
            return;
        }

        if (event?.key == "Escape") {
            this.item.name = this.oldName;
            this.rename = false;
            return;
        }
    }

    private uploader(formData: FormData) {
        
        this.storageApi.post("api/save", formData, getUrlParsed(this.item.path)).subscribe({
            next: data => {

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
            },
            complete: () => {
                this.dragover = false;
            }
        });
    }

    private interactHandler : Record<string, (item: FileNode) => void> = {
        dragstart: item => this.dragService.startDrag(item),
        dragenter: item => this.dragService.setSwapData(item),
        dragend: item => this.dragService.endDrag(item)
    }

    public commandHandler = {
        newFolder: () => {
            const named = this.item.content.filter(x => x.name.startsWith("New folder")).length;
            
            const folder = {
                content: [],
                size: 0,
                type: "folder",
                name: "New folder" + (named ? ` (${named})` : ""),
                datetime: new Date(),
                uid: crypto.randomUUID(),
                path: `${this.item.path}/New folder` + (named ? ` (${named})` : ""),
                order: this.item.content.length + 1,
            };
            
            this.storageApi.post("api/createDirectory", {path: folder.path}).subscribe(data => {
                this.item.content.push(folder);
            });
        
        },
        newFile: () => {
            this.dragover = true;
            console.log("new file");
            
        },
        rename: () => {
            this.rename = true;
        },
        copy: () => {},
        cut: () => {},
        move: () => {},
        delete: (item: FileNode) => this.delete.emit(item)

    }


}