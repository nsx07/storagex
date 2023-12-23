import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, inject } from "@angular/core";
import { DragService } from "../services/drag.service";

@Component({
    imports: [CommonModule],
    selector: 'tree-node',
    standalone: true,
    template: `
        <div class="w-full">
            
            <div class="p-2 cursor-pointer rounded hover:bg-slate-500 w-full" draggable="true" (dragenter)="interact(item, $event)" (drop)="interact(item, $event)"
                (click)="interact(item, $event)" (dragstart)="interact(item, $event)" (dragend)="interact(item, $event)">
                
                <span class="text-slate-900 dark:text-slate-200" inert>
                    @if (item.type == "file") {
                        <i class="fa-solid fa-file-lines"></i>
                    } @else {
                        <i class="fa-solid" [ngClass]="{'fa-folder': !collapseOpened, 'fa-folder-open': collapseOpened}"></i>
                    }

                    <span class="pl-2 leading-tight font-medium text-lg" inert>{{ item.name }}</span>
                </span>

            </div>

            @if (item.type == "folder" && collapseOpened) {
                <div class="pl-4">
                    @for (contentItem of item.content; track contentItem.name) {
                        <tree-node [item]="contentItem"></tree-node>
                    }
                </div>
            } 

        </div>
    `,
})
export class TreeNodeComponent implements OnInit{

    @Input() item: any;
    collapseOpened = false;

    private dragService = inject(DragService);

    constructor() {
        
    }

    ngOnInit(): void {
    }

    interact(item: any, event: DragEvent | MouseEvent) {
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
        
        this.collapseOpened = !this.collapseOpened;
    }

}