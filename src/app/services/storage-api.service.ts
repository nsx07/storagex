import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { AuthService } from "./auth.service";
import { Observable, Subject, Subscription } from "rxjs";

type Params = HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[]; };

@Injectable({providedIn: 'root'})
export class StorageApi {

    private get baseUrl() {
        return environment.apiUrl;
    }

    private set baseUrl(value: string) {
        environment.apiUrl = value;
        localStorage.setItem('apiUrl', value);
    }

    constructor(private http: HttpClient) {}

    private empty () {
        const obs = new Subject();
        obs.complete();
        return obs.asObservable();
    }

    public setApiUrl(url: string) {
        this.baseUrl = url;
        localStorage.setItem('apiUrl', url);
    }

    public getUrlObject(path: string) {
        return (this.baseUrl + ('wwwroot/' + path).replaceAll(/[\/\\]+/g, "/"));
    }

    public getRaw<T = any>(url: string, options: any) {
        return this.http.get<T>(url, options);
    }

    private waiterObservable<T = any>(origin: Observable<T>, waitCondition: () => boolean, waitTime: number = 100, timeout: number = 15000) {
        return new Observable<T>((observer) => {
            let subscription: Subscription | null = null;
    
            const cleanup = () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
    
            const interval = setInterval(() => {
                if (waitCondition()) {
                    clearInterval(interval);
                    cleanup();
                    subscription = origin.subscribe({
                        next: (value) => observer.next(value),
                        error: (error) => observer.error(error),
                        complete: () => observer.complete()
                    });
                }
            }, waitTime);
    
            // Add timeout handling
            const timeoutId = setTimeout(() => {
                clearInterval(interval);
                cleanup();
                observer.error(new Error('WaiterObservable timed out'));
            }, timeout);
    
            // Cleanup on unsubscribe
            return subscription!
        });
    }

    public get(url: string, params?: Params) {
        return this.http.get<any>(this.baseUrl + url, {params: params, withCredentials: false})
    }

    public post(url: string, body: any, params?: Params) {
        return this.http.post<any>(this.baseUrl + url, body, {params: params, withCredentials: false});

    }

    public patch(url: string, body: any, params?: Params) {
        return this.http.patch<any>(this.baseUrl + url, body, {params: params, withCredentials: false});

    }

    public put(url: string, body: any, params?: Params) {
        return this.http.put<any>(this.baseUrl + url, body, {params: params, withCredentials: false});

    }

    public delete(url: string, params?: Params, options?: any) {
        return this.http.delete<any>(this.baseUrl + url, {params: params, withCredentials: false, ...options});

    }

}