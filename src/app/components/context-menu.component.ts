import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Host, HostListener, Input, ViewChild, inject } from "@angular/core";

@Component({
    selector: 'context-menu',
    imports: [CommonModule],
    template: `
        <ng-container ariaHasPopup="true">
            <div (contextmenu)="context($event)" (click)="forMobile && context($event)">
                <ng-content></ng-content>
            </div>
        </ng-container>
        
        <div class="block absolute" *ngIf="contexton" [style.left]="menuTopLeftPosition.x" [style.top]="menuTopLeftPosition.y"> 
            <div class="dark:bg-slate-700 bg-slate-100 border-gray-200 dark:border-slate-600 w-60 rounded-lg flex flex-col text-sm py-4 px-2 dark:text-slate-200 text-gray-700 shadow-lg cursor-pointer relative" style="z-index: 1000 !important;">
                @for (item of items; track item.name) {
                    @if (item.separator) {
                        <div class="border-b border-gray-300 dark:border-gray-600"></div>
                    } @else {
                        <div class="flex hover:bg-gray-500 py-1 px-2 rounded" (click)="item.command && !checkDisabled(item) && item.command()" [ngClass]="{'opacity-50 dark:hover:bg-slate-700 hover:bg-slate-100': checkDisabled(item)}">
                            <div class="w-8 dark:text-gray-100 text-gray-950">
                                <i [class]="item.icon"></i>
                            </div>
                            <div>{{ item.name }}</div>
                        </div>
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
    
    menuTopLeftPosition =  {x: '0', y: '0'};
    private changeDetector = inject(ChangeDetectorRef);
    
    @HostListener('document:click', ['$event']) 
    clickout (event: MouseEvent) {
        this.contexton = false
        
    }

    public context(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();    
        
        this.menuTopLeftPosition.x = event.clientX + 'px'; 
        this.menuTopLeftPosition.y = event.clientY + 20 + 'px'; 

        if (event.clientX + 240 > window.innerWidth) {
            this.menuTopLeftPosition.x = (event.clientX - 240) + 'px'; 
        }
        
        this.contexton = true
        this.changeDetector.detectChanges();
    }

    public checkDisabled(item: ContextItem) {
        return item.checkDisabled && item.checkDisabled(item) || item.disabled;
    }

}

export type ContextItem = Partial<{
    type: string;
    name: string;
    icon: string;
    disabled: boolean;
    className: string;
    separator: boolean;
    command: () => void;
    style: { [key: string]: string; }
    checkDisabled: (item: any) => boolean;
}>