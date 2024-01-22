import { Routes } from '@angular/router';
import { StorageComponent } from './pages/storage/storage.component';
import { BackupComponent } from './pages/backup/backup.component';

export const routes: Routes = [
    {path: "", children: [
        {path: "explorer", component: StorageComponent},
        {path: "backup", component: BackupComponent},
        {path: "**", redirectTo: "explorer"}
    ]}
    
];
