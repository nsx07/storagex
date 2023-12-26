import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav.component';
import { StorageApi } from './services/storage-api.service';
import { HttpClientModule } from '@angular/common/http';
import { TreeNodeComponent } from './components/tree-node.component';
import { DragService } from './services/drag.service';
import { getUrlParsed } from './utils/helper-url';

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
        
      <div class="grid grid-cols-2 gap-2">
        <div class="col-span-2" [ngClass]="{'md:col-span-1': src}">
          <h1 class="italic text-xl font-semibold whitespace-nowrap p-2 dark:text-white">File Explorer</h1>
          <div class="italic w-full rounded-md flex justify-between gap-2 px-5 text-slate-900 dark:text-slate-200">
            <div class="p-2">
              <span class="pl-2 leading-tight font-medium text-lg" inert>Name</span>
            </div>
            <div class="hidden gap-9 md:block">
              <span class="pl-2 leading-tight font-medium text-lg" inert>Size (B)</span>
              <span class="pl-2 leading-tight font-medium text-lg" inert>Updated</span>
            </div>
          </div>
          
          @if (data) {
            <div class="bg-gray-100 dark:bg-slate-600 p-2 rounded-md">
              <tree-node [item]="data" (open)="open($event)" (delete)="deleteNode($event)"></tree-node>
            </div>
          }
        </div>
        
        <div class="h-full w-full bg-slate-500 rounded-md md:block hidden" *ngIf="src">
          <div class="flex justify-between items-center p-2">
            <h1 class="italic text-xl font-semibold whitespace-nowrap p-2 dark:text-white">Preview</h1>
            <span class="cursor-pointer px-2" (click)="src = null">
              <i class="fa-regular fa-circle-xmark fa-xl"></i>
            </span>
          </div>
          <p class="italic leading-5 bg-gray-600 font-medium text-md p-2"> wwwroot{{src.split("wwwroot")[1]}} </p>
          @if (isImage(src!)) {
            <div class="w-full h-auto bg-white rounded-md">
              <img class="w-full h-auto" [src]="src">
            </div>
          } @else {
            <div class="w-full h-full bg-white rounded-md flex justify-center items-center">
              <div class="p-2 text-xl">
                <i class="fa-regular fa-face-frown-open mr-3"></i>
                This file extension is not supported yet
              </div>
            </div>
          }
        </div>
      
      </div>
        
    </div>

  </div>`,
  providers: [StorageApi, DragService],
  imports: [
    CommonModule, RouterOutlet, HttpClientModule, 
    NavComponent, TreeNodeComponent
  ],
})
export class AppComponent implements OnInit {
  
  data!: FileNode;
  src!: string | null;
  
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

  isImage(value: string) {
    return value.endsWith(".jpg") || value.endsWith(".png") || value.endsWith(".jpeg") || value.endsWith(".gif");
  }

  open(value: FileNode) {
    console.log("open", value);

    this.src = this.storageApi.getUrlObject(value.path.replace(/\\/g, "/"));
    console.log(this.src);
    
  }

}
