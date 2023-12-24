import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { DragService } from "../services/drag.service";
import { FileNode } from "../app.component";

@Component({
    imports: [CommonModule],
    selector: 'tree-node',
    standalone: true,
    template: `
        <div class="w-full">
            
            <div class="p-2 cursor-pointer rounded dark:hover:bg-slate-500 hover:bg-slate-300 w-full" draggable="true" (dragenter)="interact(item, $event)" (drop)="interact(item, $event)"
                (click)="interact(item, $event)" (dragstart)="interact(item, $event)" (dragend)="interact(item, $event)">

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

            @if (item.type == "folder" && collapseOpened) {

                <div class="pl-4">
                    @for (contentItem of item.content; track contentItem.name) {
                        <tree-node [item]="contentItem" (open)="openClick($event)"></tree-node>
                    } @empty {
                        <div class="p-2 text-gray-500 dark:text-gray-400">Empty folder</div>
                    }
                </div>
            } 

        </div>
    `,
})
export class TreeNodeComponent implements OnInit{

    @Input() item: any;
    @Output() open = new EventEmitter<FileNode>();

    collapseOpened = false;

    private dragService = inject(DragService);

    constructor() {
        
    }

    ngOnInit(): void {
    }

    interact(item: FileNode, event: DragEvent | MouseEvent) {
        if (event instanceof DragEvent) {
            
            if (event.type.toLowerCase() == "dragstart") {
                this.dragService.startDrag(item);
            }

            if (event.type.toLowerCase() == "dragend") {
                this.dragService.endDrag(item);
            }
            
            if (event.type.toLowerCase() == "dragenter") {
                this.dragService.setSwapData(item);
            }

            return;
        }

        if (item.type == "file") {
            this.openClick(item);
        }
        
        this.collapseOpened = !this.collapseOpened;
    }

    openClick(item: FileNode) {
        this.open.emit(item);
    }

}