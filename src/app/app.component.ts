import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav.component';
import { StorageApi } from './services/storage-api.service';
import { HttpClientModule } from '@angular/common/http';
import { TreeNodeComponent } from './components/tree-node.component';
import { DragService } from './services/drag.service';

export type FileNode = {
  name: string;
  type: string;
  order: number;
  uid: string;
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
        
        @if (data) {
          <div class="bg-gray-100 dark:bg-slate-600 p-2 rounded-md">
            <tree-node [item]="data"></tree-node>
          </div>
        }
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
  
  private storageApi = inject(StorageApi);
  private dragService = inject(DragService);

  ngOnInit(): void {
    this.storageApi.get("api/listTree").subscribe((data: Array<FileNode>) => this.data = this.prepareData(data)[0]);
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
    this.setToTree(from, to);    
  }

  setToTree(node: FileNode, entry: FileNode) {
    entry.content.push(node);
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

  context($event : MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
  }

}
