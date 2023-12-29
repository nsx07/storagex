import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav.component';
import { StorageApi } from './services/storage-api.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TreeNodeComponent } from './components/tree-node.component';
import { DragService } from './services/drag.service';
import { getUrlParsed } from './utils/helper-url';
import { FileViewComponent } from './components/file-view.component';
import { AuthService } from './services/auth.service';

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
    CommonModule, RouterOutlet, HttpClientModule, 
    NavComponent, TreeNodeComponent, FileViewComponent
  ],
})
export class AppComponent implements OnInit {
  
  data!: FileNode;
  src!: string | undefined;

  fileView = false;
  
  private storageApi = inject(StorageApi);
  private dragService = inject(DragService);

  ngOnInit(): void {
    this.storageApi.get("api/listTree").subscribe((data: Array<FileNode>) => {
      this.data = this.prepareData(data)[0]
      console.log(this.data);
      
    });
    this.dragService.swap().subscribe(swap => this.swap(swap.drag!, swap.drop!))
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
    

    options.body.projectName && this.storageApi.delete(endpoint, undefined, options).subscribe({
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
