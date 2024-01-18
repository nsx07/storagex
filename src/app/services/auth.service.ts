import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private isLogged = false;

    public get isAuthenticated(): boolean {
        return this.isLogged;
    }

    private http = inject(HttpClient);

    async validateToken(token: string): Promise<any> {
        return firstValueFrom(this.http.get<any>(environment.apiUrl + `api/validateToken?token=${token}`)).then(data => {
            localStorage.setItem('token', token);            
            return data;
        });
    }

    async autoDetectLogin() : Promise<boolean> {
        const token = localStorage.getItem('token');
        if (token) {
            const data = await this.validateToken(token);
            if (data.success) {
                this.isLogged = true;
                return Promise.resolve(true);;
            }  
        }
        return Promise.resolve(false);
    }

}
