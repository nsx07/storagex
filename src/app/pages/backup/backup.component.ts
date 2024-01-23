import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { StorageApi } from '../../services/storage-api.service';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal.component';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent
  ],
  template: `
    <div class="container mx-auto w-full py-4 md:px-2 px-4">
      
      <div class="flex items-center justify-between mb-2">
        <h1 class="leading-tight tracking-tight text-xl font-semibold whitespace-nowrap p-2 dark:text-white">Backups</h1>
        <button (click)="add()" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-0 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          <i class="fa-solid fa-plus mr-2"></i>
          NEW
        </button>
      </div>

      <div class="relative overflow-x-auto shadow-md rounded-lg">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 p-2">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-slate-300">
                  <tr>
                      <th scope="col" class="px-6 py-3">
                          Name
                      </th>
                      <th scope="col" class="px-6 py-3">
                          Folder
                      </th>
                      <th scope="col" class="px-6 py-3">
                          Cron
                      </th>
                      <th scope="col" class="px-6 py-3">
                          Connection String
                      </th>
                      <th class="text-center"> <i class="fa-solid fa-wrench fa-lg"></i> </th>
                  </tr>
              </thead>
              <tbody>
                  @for (item of data; track $index) {
                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {{item.name}}
                      </th>
                      <td class="px-6 py-4">
                          {{item.folder}}
                      </td>
                      <td class="px-6 py-4">
                          {{item.cron}}
                      </td>
                      <td class="px-6 py-4">
                          {{item.connectionString}}
                      </td>
                      <td>
                        <div class="flex justify-center gap-2 items-center">
                          <i (click)="update(item)" class="fa-solid fa-edit fa-lg cursor-pointer"></i>
                          <i (click)="remove(item.key)" class="fa-solid fa-trash fa-lg cursor-pointer"></i>
                        </div>
                      </td>
                  </tr>
                  } @empty {
                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td colspan="5">
                        <div class="flex items-center justify-center p-2">
                          <p class="text-lg leading-7 px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">No backups is setup. <b class="tracking-tighter">Setup!</b></p>
                        </div>
                      </td>
                    </tr>
                  }
              </tbody>
          </table>
      </div>

      <modal [(visible)]="modal" [title]="title" [closable]="true" *ngIf="formBackup" [backdropClass]="'backdrop-opacity-50'">
        <div class="px-3 pt-2">

          <form [formGroup]="formBackup">
            <div class="grid gap-2 sm:grid-cols-2 grid-cols-1">
                  <div class="col">
                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Name
                    </label>
                    <input placeholder="Ex: AppBackupV1..." type="text" id="name" formControlName="name" class="appearance-none outline-none py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" >
                  </div>

                  <div class="col">
                    <label for="folder" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Folder
                    </label>
                    <input placeholder="Ex: AppBackup..." type="text" id="folder" formControlName="folder" class="appearance-none outline-none py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" >
                  </div>

                  <div class="col">
                    <label for="cron" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Cron
                    </label>
                    <input placeholder="Ex: * * 1 * * *" type="text" id="cron" formControlName="cron" class="appearance-none outline-none py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" >
                  </div>


                  <div class="col">
                    <label for="connectionString" class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Connection String
                    </label>
                    <input placeholder="Ex: postgresql://postgres:password@localhost:5432/postgres" type="text" id="connectionString" formControlName="connectionString" class="appearance-none outline-none py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" >
                  </div>

                  <div class="col">
                    <div class="flex items-center">
                        <input id="zip" type="checkbox" formControlName="zip" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600">
                        <label for="zip" class="ms-2 text-sm font-medium select-none text-gray-900 dark:text-gray-300">Zip</label>
                    </div>
                    <div class="flex items-center">
                        <input id="continuos" type="checkbox" formControlName="continuos" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600">
                        <label for="continuos" class="ms-2 text-sm font-medium select-none text-gray-900 dark:text-gray-300">Continuos</label>
                    </div>
                  </div>

            </div>
                 
          </form>

          <div class="py-3 px-2 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 transition duration-150 ease-out hover:ease-in" role="alert" *ngIf="!formBackup.get('continuos').value">
            <span class="font-medium align-top text-start text-wrap">
              <i class="fa-solid fa-circle-exclamation fa-lg mr-2"></i>
              span class="indent-8 tracking-tight"> Setting continuos to <code>false</code> will run this backup once and it won't be listed at this listing. </span>
            </span>
          </div>

          <div class="py-3 px-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert" *ngIf="message && message.trimEnd().length">
            <span class="font-medium">Error!</span> {{message}}
          </div>
          
          <div class="flex items-center justify-end gap-2 pt-4">
            <button [disabled]="!formBackup.touched" (click)="cancel()" type="button" class="text-white disabled:cursor-not-allowed bg-red-700 disabled:bg-red-500 disabled:hover:bg-red-700 hover:bg-red-800 focus:ring-0 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center disabled:dark:bg-red-500 dark:bg-red-600 disabled:dark:hover:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
              <i class="fa-solid fa-times mr-2"></i>
              Cancel
            </button>
            <button [disabled]="!formBackup.valid" (click)="save()" type="button" class="text-white disabled:cursor-not-allowed bg-green-700 disabled:bg-green-500 disabled:hover:bg-green-700 hover:bg-green-800 focus:ring-0 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center disabled:dark:bg-green-500 dark:bg-green-600 disabled:dark:hover:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
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
      </modal>
                  
    </div>
  `,
  styleUrl: './backup.component.css',
})
export class BackupComponent implements OnInit {

  message = "";
  modal = false;
  loading = false;
  data: any[] = [];
  title = "New Backup";
  formBackup!: FormGroup;
  keySelected = "";

  private storageApi = inject(StorageApi);
  private formBuilder = inject(FormBuilder);

  ngOnInit() {
    this.createForm();
    this.getData();
  }

  private async getData() {
    let result = await firstValueFrom(this.storageApi.get("api/listBackups"));
    console.log(result);
    
    this.data = result.schedules;
  }

  private createForm() {
    this.formBackup = this.formBuilder.group({
      zip: [true],
      continuos: [true],
      name: [null, Validators.required],
      // if omitted, server will execute at 01:00 GMT America/Sao_Paulo
      cron: [null, Validators.required],
      folder: [null, Validators.required],
      connectionString: [null, Validators.required],
    });
  }

  add() {
    this.title = "New Backup";
    this.modal = true;
  }

  cancel() {
    
    this.formBackup.reset();
    this.modal = false;
  }

  update(backup: any) {
    this.formBackup.patchValue(backup);
    this.title = "Update Backup";
    this.keySelected = backup.key;
    this.editing = true;
    this.modal = true;
  }

  editing = false;

  save() {
    this.loading = true;
    console.log(this.formBackup.value);
    const value = this.formBackup.value;
    value.key = this.keySelected;
    this.storageApi.post( this.editing ? "api/updateBackup" : "api/backup", value).subscribe({
      next: (x) => {
        console.log(x);
        
        if (x) {
          value.key = `backup:${value.name}`;
          this.message = "";
          
          if (this.editing) {
            let index = this.data.findIndex(d => d.key === this.keySelected);
            this.data[index] = value;
          } else if (value.continuos) {
            this.data.push(value);
          }
        }
      },
      error: (e) => {
        this.message = e.error.message;
        this.loading = false;
      },
      complete: () => this.loading = false,
    })
  }

  remove(key: string) {
    console.log(key);
    this.storageApi.delete("api/removeBackup", {name:key.split(":")[1]}).subscribe({
      next: (x) => {
        console.log(x);
        if (x) {
          this.data = this.data.filter(x => x.key != key);
        }
      },
      error: (e) => {
        this.message = e.error.message;
        this.loading = false;
      },
      complete: () => this.loading = false,
    });
  }

  

}
