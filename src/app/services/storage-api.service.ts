import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";

type Params = HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[]; };

@Injectable({providedIn: 'root'})
export class StorageApi {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    public getUrlObject(path: string) {
        return (this.baseUrl + ('wwwroot/' + path).replaceAll(/[\/\\]+/g, "/"));
    }

    public getRaw<T = any>(url: string, options: any) {
        return this.http.get<T>(url, options);
    }

    public get(url: string, params?: Params) {
        return this.http.get<any>(this.baseUrl + url, {params: params});
    }

    public post(url: string, body: any, params?: Params) {
        return this.http.post<any>(this.baseUrl + url, body, {params: params});
    }

    public patch(url: string, body: any, params?: Params) {
        return this.http.patch<any>(this.baseUrl + url, body, {params: params});
    }

    public put(url: string, body: any, params?: Params) {
        return this.http.put<any>(this.baseUrl + url, body, {params: params});
    }

    public delete(url: string, params?: Params, options?: any) {
        return this.http.delete<any>(this.baseUrl + url, {params: params, ...options});
    }

}