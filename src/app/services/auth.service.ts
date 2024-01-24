import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private isLogged = false;

    private requestLogin = new Subject();

    private get baseUrl() {
        return environment.apiUrl;
    }

    private set baseUrl(value: string) {
        environment.apiUrl = value;
        sessionStorage.setItem('apiUrl', value);
    }

    public get isAuthenticated(): boolean {
        return this.isLogged;
    }

    public get loginRequests() {
        return this.requestLogin.asObservable();
    }

    private http = inject(HttpClient);

    public input() {
        this.requestLogin.next(0);
    }

    async validateToken(token: string): Promise<any> {
        return firstValueFrom(this.http.get<any>(this.baseUrl + `api/validateToken?token=${token}`)).then(data => {
            sessionStorage.setItem('token', token);
            this.isLogged = true;            
            return data;
        });
    }

    async autoDetectLogin() : Promise<boolean> {
        const token = sessionStorage.getItem('token');
        if (token) {
            const data = await this.validateToken(token);
            if (data.success) {
                this.isLogged = true;
                return Promise.resolve(true);;
            }  
        }
        return Promise.resolve(false);
    }

    async logout() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('url');

        this.isLogged = false;
    }

}
