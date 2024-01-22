import { CommonModule, DOCUMENT } from "@angular/common";
import { Component, HostListener, Inject, Input } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

@Component({
    selector: 'sidebar',
    standalone: true,
    template: `
    
        <button (click)="open = true" data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
            <span class="sr-only">Open sidebar</span>
            <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
        </button>

        <aside id="default-sidebar" class="sm:fixed relative pt-[3.75rem] top-0 left-0 z-20 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar" [ngClass]="{'w-12': !open}"
            (mouseenter)="open = true" (mouseleave)="open = false">
            <div class="h-full py-4 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-800" [ngClass]="{'px-3 ': open}">
                <ul class="space-y-3 font-medium">
                    <li>
                        <a [routerLink]="['/explorer']" class="cursor-pointer flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" 
                            [ngClass]="{'bg-gray-400 font-semibold text-slate-950': open && isCurrent('explorer'), 'justify-center': !open}">
                            
                            <i class="fa-solid fa-folder-tree w-5 h-5 text-gray-800 dark:text-white transition duration-75 group-hover:text-gray-900 dark:group-hover:text-white"></i>
                            <span class="ms-3" *ngIf="open">Explorer</span>
                        </a>
                    </li>
                    <li>
                        <a [routerLink]="['/backup']" class="cursor-pointer flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" 
                            [ngClass]="{'bg-gray-400 font-semibold text-slate-950': open && isCurrent('backup'), 'justify-center': !open}">
                            <i class="fa-solid fa-database w-5 h-5 text-gray-800 dark:text-white transition duration-75 group-hover:text-gray-900 dark:group-hover:text-white"></i>
                            <span class="ms-3" *ngIf="open">Backup</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>


    `,
    styles: ``,
    imports: [CommonModule, RouterModule]
})
export class SidebarComponent {

    @Input() open = false;
    
    constructor(
        @Inject(DOCUMENT) private document: Document,
        private router: Router
      ) {}
    
    isCurrent(path: string) {
        return location.pathname.includes(path);
    }

}