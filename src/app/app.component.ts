import { Component, HostListener, OnInit, inject } from '@angular/core';
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
import { FileService } from './services/file.service';
import { SidebarComponent } from './components/sidebar.component';
import { timeout } from 'rxjs';

export type FileNode = {
  uid: string;
  name: string;
  type: string;
  size: number;
  path: string;
  order: number;
  datetime: Date;
  content: FileNode[];
};

@Component({
  standalone: true,
  selector: 'app-root',
  template: ` <div
    class="w-screen h-screen overflow-auto dark:bg-slate-700 backdrop-blur-lg bg-gray-300"
  >
    <modal [(visible)]="modal" [(closable)]="closable">
      <div>
        <form id="token-form" class="py-2">
          <div class="flex flex-col gap-2">
            <p class="text-3xl text-center leading-8">
              <b
                class="dark:text-slate-100 text-slate-800 font-bold -tracking-tigher"
                >Storage</b
              ><span
                class="dark:text-slate-950 text-slate-100 font-semibold -tracking-wider"
                >API</span
              >
            </p>

            <input
              class="appearance-none outline-none py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
              [(ngModel)]="url"
              [ngModelOptions]="{ standalone: true }"
              type="text"
              placeholder="StorageApi Url"
            />

            <input
              class="appearance-none outline-none py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
              [(ngModel)]="token"
              [ngModelOptions]="{ standalone: true }"
              type="text"
              placeholder="StorageApi Token"
            />

            <div class="min-w-10 flex items-center justify-end">
              <button
                type="button"
                class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none disabled:opacity-75 disabled:bg-gray-600 disabled:hover:bg-gray-600 focus:ring-red-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                (click)="auth.isAuthenticated && logout()"
                [disabled]="!auth.isAuthenticated"
              >
                Logout
              </button>
              <button
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none disabled:opacity-75 disabled:bg-gray-600 disabled:hover:bg-gray-600 focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                (click)="!invalid() && sendToken()"
                type="submit"
                form="token-form"
                [disabled]="invalid()"
              >
                @if (!loading) {
                <svg
                  class="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
                <span class="sr-only">Icon description</span>
                } @else {
                <span role="status">
                  <svg
                    aria-hidden="true"
                    class="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-green-400"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span class="sr-only">Loading...</span>
                </span>
                }
              </button>
            </div>
          </div>
        </form>

        @if (tokenMessage) {
        <div
          class="p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <span class="font-medium">Error!</span> {{ tokenMessage }}
        </div>
        }
      </div>
    </modal>

    <navheader></navheader>
    <sidebar></sidebar>

    <div class="sm:pl-12 pl-0" *ngIf="auth.isAuthenticated && !refresh">
      <router-outlet></router-outlet>
    </div>
  </div>`,
  providers: [StorageApi, DragService, AuthService, FileService],
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    FormsModule,
    SidebarComponent,
    NavComponent,
    TreeNodeComponent,
    FileViewComponent,
    ModalComponent,
  ],
})
export class AppComponent implements OnInit {
  url = '';
  token = '';
  tokenMessage = '';

  modal = false;
  loading = false;
  refresh = false;
  closable = false;

  private storageApi = inject(StorageApi);
  public auth = inject(AuthService);

  async ngOnInit() {
    this.loading = true;
    this.closable = !this.auth.isAuthenticated;
    this.auth
      .autoDetectLogin()
      .then((data) => {
        if (data) {
          this.init();
          return;
        }

        this.modal = true;
      })
      .catch((e) => {
        console.log(e);
        this.modal = true;
      })
      .finally(() => (this.loading = false));

    this.auth.loginRequests.subscribe(() => (this.modal = true));
  }

  logout() {
    console.log('logout');
    this.closable = false;
    this.auth.logout();
    this.modal = true;
    this.refresher();
  }

  refresher() {
    this.refresh = true;
    setTimeout(() => {
      this.refresh = false;
    }, 100);
  }

  invalid() {
    return !this.url || !this.token;
  }

  init() {}

  sendToken() {
    this.loading = true;

    this.storageApi.setApiUrl(this.url);

    this.auth
      .validateToken(this.token)
      .then((data) => {
        console.log(data);

        if (data.success) {
          this.init();
          this.modal = false;
          this.refresher();
        } else {
          this.tokenMessage =
            data.message ?? data.error.message ?? 'Invalid token';
        }
      })
      .catch((error) => {
        console.log(error);
        this.tokenMessage =
          error.error.message ?? error.message ?? 'Invalid token';
      })
      .finally(() => (this.loading = false));
  }
}
