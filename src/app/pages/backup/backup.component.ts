import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { StorageApi } from '../../services/storage-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `
    <div class="container mx-auto w-full py-4 md:px-2 px-4">
      
      <h1 class="italic text-xl font-semibold whitespace-nowrap p-2 dark:text-white">Backups</h1>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 p-2">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                  </tr>
                  }
              </tbody>
          </table>
      </div>
      



    </div>
  `,
  styleUrl: './backup.component.css',
})
export class BackupComponent implements OnInit {

  data: any[] = [];

  private storageApi = inject(StorageApi);

  async ngOnInit() {
    let result = await firstValueFrom(this.storageApi.get("api/listBackups"));
    this.data = result.schedules;
    console.log(result);
  }

}
