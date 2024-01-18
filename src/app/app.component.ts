import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav.component';
import { StorageApi } from './services/storage-api.service';
import { HttpClientModule } from '@angular/common/http';
import { TreeNodeComponent } from './components/tree-node.component';
import { DragService } from './services/drag.service';
import { getUrlParsed } from './utils/helper-url';
import { FileViewComponent } from './components/file-view.component';
import { AuthService } from './services/auth.service';
import { ModalComponent } from './components/modal.component';
import { FormsModule } from '@angular/forms';

export type FileNode = {
  uid: string;
  name: string;
  type: string;
  size: number;
  path: string;
  order: number;
  datetime: Date;
  content: FileNode[];
}

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
  <div class="w-screen h-screen overflow-auto dark:bg-slate-700 bg-gray-300">
    <modal [(visible)]="modal" [closable]="false">
      <div>
        <form id="token-form" class="py-2">
          <div class="flex flex-col gap-2">
            <p class="text-3xl text-center leading-8">
              <b class="dark:text-slate-100 text-slate-800 font-bold -tracking-tigher">Storage</b><span class="dark:text-slate-950 text-slate-100 font-semibold -tracking-wider">API</span>
            </p>

            <input class="appearance-none outline-none py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" 
              [(ngModel)]="url" [ngModelOptions]="{standalone: true}" type="text" placeholder="StorageApi Url">
            
            <input class="appearance-none outline-none py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" 
              [(ngModel)]="token" [ngModelOptions]="{standalone: true}" type="text" placeholder="StorageApi Token">

            <div class="min-w-10 flex items-center justify-end">
              <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none disabled:opacity-75 disabled:bg-gray-600 disabled:hover:bg-gray-600 focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
                (click)="!invalid() && sendToken()" type="submit" form="token-form" [disabled]="invalid()">
                @if (!loading) {
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                    <span class="sr-only">Icon description</span>
                  } @else {
                    <span role="status">
                    <svg aria-hidden="true" class="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-green-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span class="sr-only">Loading...</span>
                  </span>
                }
              </button>
            </div>
              
          </div>
        </form>

        @if (tokenMessage) {
          <div class="p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span class="font-medium">Error!</span> {{tokenMessage}}  
          </div>
        }
      </div>
    </modal>
  
    <div class="top-0 left-0">
        <app-nav></app-nav> 
    </div>

    <div class="container mx-auto w-full py-4 md:px-2 px-4" (contextmenu)="context($event)">
        
      <h1 class="italic text-xl font-semibold whitespace-nowrap p-2 dark:text-white">File Explorer</h1>
      
      <div class="grid md:grid-cols-2 grid-cols-1 gap-2" [ngClass]="{'md:grid-cols-2 grid-cols-1': fileView}">
        <div [ngClass]="{'md:col-span-1 col-span-2': fileView, 'col-span-2': !fileView}">
          
          @if (data) {
            <div class="bg-gray-100 dark:bg-slate-600 p-2 rounded-md">
              <div class="italic w-full rounded-md flex justify-between gap-2 px-5 text-slate-900 dark:text-slate-200">
                <div class="p-2">
                  <span class="pl-2 leading-tight font-medium text-lg" inert>Name</span>
                </div>
                <div class="hidden gap-9 md:block">
                  <span class="pl-2 leading-tight font-medium text-lg" inert>Size (B)</span>
                  <span class="pl-2 leading-tight font-medium text-lg" inert>Updated</span>
                </div>
              </div>
              <tree-node [item]="data" (open)="open($event)" (delete)="deleteNode($event)"></tree-node>
            </div>
          }
        </div>
        
        <div class="col-span-1" *ngIf="fileView">
          <file-view [src]="src" [visible]="fileView" (close)="close()"></file-view>
        </div>
      
      </div>
        
    </div>

  </div>`,
  providers: [StorageApi, DragService, AuthService],
  imports: [
    CommonModule, RouterOutlet, HttpClientModule, FormsModule,
    NavComponent, TreeNodeComponent, FileViewComponent, ModalComponent
  ],
})
export class AppComponent implements OnInit {
  
  data!: FileNode;
  src!: string | undefined;

  url = "";
  token = "";  
  tokenMessage = "";  

  modal = true;
  fileView = false;
  loading = false;
  
  private storageApi = inject(StorageApi);
  private dragService = inject(DragService);
  public auth = inject(AuthService);

  async ngOnInit(){
    this.loading = true;
    this.auth.autoDetectLogin().then(data => {
      if (data) {
        this.init();
      }

      this.modal = !data;
    }).finally(() => this.loading = false);  

  }

  invalid() {
    return !this.url || !this.token;
  }

  init() {
    this.storageApi.get("api/listTree").subscribe((data: Array<FileNode>) => {
      this.data = this.prepareData(data)[0]
      console.log(this.data);
    });
    this.dragService.swap().subscribe(swap => this.swap(swap.drag!, swap.drop!))
  }

  sendToken() {
    this.loading = true;

    this.storageApi.setApiUrl(this.url);

    this.auth.validateToken(this.token)
      .then(data => {
      console.log(data);
      
      if (data.success) {
        this.init();
        this.modal = false;
      } else {
        this.tokenMessage = data.message ?? data.error.message ?? "Invalid token";
      }
      })
      .catch(error => {
        console.log(error);
        this.tokenMessage = error.error.message ?? error.message ?? "Invalid token";
      })
      .finally(() => this.loading = false);
  }

  prepareData(data: FileNode[]) {
    for (let i = 0; i < data.length; i++) {
      data[i].uid = crypto.randomUUID();
      data[i].order = i;
      if (data[i].type == "folder") {
        data[i].content = this.prepareData(data[i].content);
      }
    }
    return data;
  }

  swap(from: FileNode, to: FileNode) {
    this.takeFromTree(from);
    this.setToTree(from, to);    2
  }

  setToTree(node: FileNode, entry: FileNode) {
    
    if (entry.type == "file") {
      entry = this.getFromTree(entry, (folder) => folder.content.some(x => x.uid == entry.uid))!;      
    }
   
    entry.content.push(node);
  }

  deleteNode(node: FileNode) {
    console.log("delete", node);

    let url = getUrlParsed(node.path);

    let options = {
      body: {
        projectName: url.projectName,
        projectScope: url.projectScope,
        fileName: node.name
      }
    };
    console.log(options);

    let endpoint = node.type == "folder" ? "api/deleteDirectory" : "api/delete";
    

    options.body.projectName && this.storageApi.delete(endpoint, options.body).subscribe({
      next: () => {
        this.takeFromTree(node);
      },
      error: (err) => console.log(err)
    });
    
  }

  takeFromTree(target: FileNode, node: FileNode = this.data) {
    for (let i = 0; i < node.content.length; i++) {
      if (node.content[i].uid == target.uid) {
        node.content.splice(i, 1);
        return;
      }

      if (node.content[i].type == "folder") {
        this.takeFromTree(target, node.content[i]);
      }
    }
  }
  
  getFromTree(target: FileNode, filterFn: (node: FileNode, index: number) => boolean, node: FileNode = this.data ) : FileNode | null {
    for (let i = 0; i < node.content.length; i++) {
      if (filterFn(node, i)) {
        return node;
      }

      if (node.content[i].type == "folder") {
        return this.getFromTree(target, filterFn, node.content[i]);
      }
    }
    return null;
  }

  context($event : MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  close() {
    this.fileView = false;
    this.src = undefined;
  }

  open(value: FileNode) {
    console.log("open", value);

    this.src = this.storageApi.getUrlObject(value.path.replace(/\\/g, "/"));
    this.fileView = true;
    console.log(this.src);
    
  }

}
