import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { AuthService } from "./auth.service";
import { Observable, Subject, Subscription } from "rxjs";

type Params = HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[]; };

@Injectable({providedIn: 'root'})
export class StorageApi {

    private baseUrl = environment.apiUrl;

    private initiated = false

    constructor(private http: HttpClient, private auth: AuthService) {
        this.auth.init().then(() => this.initiated = true);
        this.auth.isLoggedIn().then((isLoggedIn) => this.initiated = true);
    }

    private empty () {
        const obs = new Subject();
        obs.complete();
        return obs.asObservable();
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
        // unwrap this observable to wait initiated variable be truly
        return this.http.get<any>(this.baseUrl + url, {params: params, withCredentials: false})
    }

    public post(url: string, body: any, params?: Params) {
        return this.initiated 
            ? this.http.post<any>(this.baseUrl + url, body, {params: params, withCredentials: false})
            : this.empty();

    }

    public patch(url: string, body: any, params?: Params) {
        return this.initiated 
            ? this.http.patch<any>(this.baseUrl + url, body, {params: params, withCredentials: false})
            : this.empty();

    }

    public put(url: string, body: any, params?: Params) {
        return this.initiated 
            ? this.http.put<any>(this.baseUrl + url, body, {params: params, withCredentials: false})
            : this.empty();

    }

    public delete(url: string, params?: Params, options?: any) {
        return this.initiated 
            ? this.http.delete<any>(this.baseUrl + url, {params: params, withCredentials: false, ...options})
            : this.empty();

    }

}