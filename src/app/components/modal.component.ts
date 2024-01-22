import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'modal',
  standalone: true,
  imports: [CommonModule],
  template : `
   @if (visible) {
    <div class="fixed inset-0 z-40 min-h-full overflow-y-auto overflow-x-hidden transition flex items-center">
    <!-- overlay -->
      <div aria-hidden="true" class="fixed inset-0 w-full h-full backdrop-blur-sm bg-black/50 cursor-pointer">
      </div>

      <!-- Modal -->
      <div class="relative w-full cursor-pointer pointer-events-none transition-transform	 my-auto p-4">
          <div class="w-full py-2 bg-gray-300 cursor-default pointer-events-auto dark:bg-gray-800 relative rounded-xl mx-auto max-w-sm" [style]="style">

              <div class="flex justify-between items-center pb-2 px-4" *ngIf="header">
                @if (title) {
                  <div>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200" [ngClass]="{'hidden': title == 'hidden__'}">
                        {{title}}
                    </h3>
                  </div>
                }
                @if (isClosable) {
                  <div class="min-w-8 flex justify-end">
                    <button type="button" >
                      <svg title="Close" tabindex="-1" class="h-4 w-4 cursor-pointer text-gray-400" (click)="visible = false"
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clip-rule="evenodd"></path>
                      </svg>
                      <span class="sr-only">
                          Close
                      </span>
                    </button>

                  </div>
                }
              </div>



              <div class="space-y-2 p-2">
                  <ng-content></ng-content>
              </div>


          </div>
      </div>
      
    </div>
   }
  `
  
})
export class ModalComponent implements OnInit {
  
  ngOnInit(): void {
    
    this.header = this.header || !!this.title || this.closable;
    this.title = this.title || (this.header ? 'hidden__' : '');
  }

  isVisible = false;
  isClosable = false;

  @Input() header = false;
  @Input() title = '';
  @Input() style: Record<string, string> = {};
  
  @Input() 
  get closable(): boolean {
    return this.isClosable;
  }
  set closable(value: boolean) {
    if (value) {
      this.open.emit(value);
    } else {
      this.close.emit(value);
    }
    
    this.closableChange.emit(value);
    this.isClosable = value;
  }
  @Input() 
  get visible(): boolean {
    return this.isVisible;
  }
  set visible(value: boolean) {
    if (value) {
      this.open.emit(value);
    } else {
      this.close.emit(value);
    }
    
    this.visibleChange.emit(value);
    this.isVisible = value;
  }

  
  @Output() visibleChange = new EventEmitter();
  @Output() closableChange = new EventEmitter();
  @Output() open = new EventEmitter();
  @Output() close = new EventEmitter();


}
