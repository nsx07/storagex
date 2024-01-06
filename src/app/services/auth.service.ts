import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageApi } from './storage-api.service';
import createKindeClient, { KindeClient, KindeUser } from "@kinde-oss/kinde-auth-pkce-js";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor() {
        //this.init()
    }

    kinde: KindeClient | undefined;

    async init(){
        this.kinde = await createKindeClient({
            client_id: "084939a75ce1432db7c832d292638c89",
            domain: "https://nsxoseven.kinde.com",
            redirect_uri: window.location.origin + '/',
            on_redirect_callback: this.onRedirectCallback.bind(this),
        });

        if (! (await this.kinde.isAuthenticated()) && navigator.onLine) {
            await this.kinde.login();
        }
        
        return Promise.resolve()
    }

    async onRedirectCallback(user: KindeUser, appState?: object){
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        console.log(user, await this.kinde?.getToken());
    }

    async login(): Promise<any> {
        this.kinde?.login();
    }

    async logout(): Promise<any> {
        this.kinde?.logout();
        localStorage.clear();
    }

    async register(): Promise<any> {
        this.kinde?.register();
    }

    async isLoggedIn(): Promise<boolean> {
        return this.kinde?.isAuthenticated() || this.getUsedData() !== undefined || false;
    }

    getUsedData(): KindeUser | undefined {
        return this.kinde?.getUser() || localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : undefined;
    }

    getCodeVerifier(): string {
        return sessionStorage.getItem('code_verifier') || '';
    }

}
