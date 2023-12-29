import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, HostListener, Input, Output, ViewChild, inject } from "@angular/core";

@Component({
    selector: 'context-menu',
    imports: [CommonModule],
    template: `
        <ng-container ariaHasPopup="true">
            <div (contextmenu)="context($event)" (click)="click($event)">
                <ng-content></ng-content>
            </div>
        </ng-container>
        
        <div class="block absolute" *ngIf="contexton" [style.left]="menuTopLeftPosition.x" [style.top]="menuTopLeftPosition.y"> 
            <div class="dark:bg-slate-900 bg-slate-100 border-gray-200 dark:border-slate-600 w-60 rounded-lg flex flex-col text-sm p-2 dark:text-slate-200 text-gray-700 shadow-lg cursor-pointer relative" style="z-index: 1000 !important;">
                @for (item of items; track item.name) {
                    @if (!checkHide(item)) {
                        @if (item.separator) {
                        <div class="border-b border-gray-300 dark:border-gray-600"></div>
                        } @else {
                            <div class="flex hover:bg-slate-500 py-1 px-2 rounded" (click)="item.command && !checkDisabled(item) && item.command()" [ngClass]="{'opacity-50 dark:hover:bg-slate-700 hover:bg-slate-100': checkDisabled(item)}">
                                <div class="w-8 dark:text-gray-100 text-gray-950">
                                    <i [class]="item.icon"></i>
                                </div>
                                <div inert>{{ item.name }}</div>
                            </div>
                        }
                    }
                }
                
            </div>
        </div>

    `,
    standalone: true,
    
})
export class ContextMenuComponent {

    @Input() items: ContextItem[] = [];

    @Input() contexton = false;
    @Input() forMobile = false;

    @Output() contextonChange = new EventEmitter<boolean>();
    
    menuTopLeftPosition =  {x: '0', y: '0'};
    private changeDetector = inject(ChangeDetectorRef);
    
    @HostListener('document:click', ['$event']) 
    clickout (event: MouseEvent) {
        this.contexton = false
        
    }

    public context(event: MouseEvent, override = false) {
        if (this.forMobile && !override) return;

        
        event.preventDefault();
        event.stopPropagation();    
        
        this.menuTopLeftPosition.x = event.clientX + 'px'; 
        this.menuTopLeftPosition.y = event.clientY + 'px'; 

        if (event.clientX + 240 > window.innerWidth) {
            this.menuTopLeftPosition.x = (event.clientX - 220) + 'px'; 
        }

        if (event.clientY + 240 > window.innerHeight) {
            this.menuTopLeftPosition.y = (event.clientY - 240) + 'px'; 
        }
        
        this.contexton = true
        this.changeDetector.detectChanges();
        this.contextonChange.emit(this.contexton);
    }

    public click($event: MouseEvent) {
        if (!this.forMobile || this.contexton) {
            this.contextonChange.emit(false);   
            return;
        }

        this.context($event, true)
    }

    public checkDisabled(item: ContextItem) {
        return item.checkDisabled && item.checkDisabled(item) || item.disabled;
    }

    public checkHide(item: ContextItem) {
        return item.checkHide && item.checkHide(item) || item.hidden;
    }

}

export type ContextItem = Partial<{
    type: string;
    name: string;
    icon: string;
    disabled: boolean;
    className: string;
    separator: boolean;
    hidden: boolean;
    command: () => void;
    style: { [key: string]: string; }
    checkHide : (item: any) => boolean;
    checkDisabled: (item: any) => boolean;
}>