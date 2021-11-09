import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpFallbackService {

  constructor(private http: HttpClient) { }

  private _get<T>(data: { url: string, option?: any, count: number, timeout?: number }): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http.get<T>(data.url, data.option).toPromise()
        .then((res: any) => resolve(res))
        .catch(err => {
          if (data.count > 5) {
            reject(err);
          }
          else {
            setTimeout(() => {
              data.count++;
              this._get<T>(data).then(resolve).catch(reject);
            }, data.timeout ?? 3000)
          }
        });
    });
  }

  get<T>(url: string, option?): Promise<T> {
    return this._get<T>({ url, option, count: 0 });
  }

  private _post<T>(data: { url: string, body: any, option?: any, count: number, timeout?: number }): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http.post<T>(data.url, data.body, data.option).toPromise()
        .then((res: any) => resolve(res))
        .catch(err => {
          if (data.count > 5) {
            reject(err);
          }
          else {
            setTimeout(() => {
              data.count++;
              this._post<T>(data).then(resolve).catch(reject);
            }, data.timeout ?? 3000)
          }
        });
    });
  }

  post<T>(url: string, body: any, option?): Promise<T> {
    return this._post<T>({
      url, body, option, count: 0
    })
  }

  private _put<T>(data: { url: string, body: any, option?: any, count: number, timeout?: number }): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http.put<T>(data.url, data.body, data.option).toPromise()
        .then((res: any) => resolve(res))
        .catch(err => {
          if (data.count > 5) {
            reject(err);
          }
          else {
            setTimeout(() => {
              data.count++;
              this._put<T>(data).then(resolve).catch(reject);
            }, data.timeout ?? 3000)
          }
        });
    });
  }

  put<T>(url: string, body: any, option?): Promise<T> {
    return this._put<T>({ url, body, option, count: 0 });
  }

  private _delete<T>(data: { url: string, option?: any, count: number, timeout?: number }): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http.delete<T>(data.url, data.option).toPromise()
        .then((res: any) => resolve(res))
        .catch(err => {
          if (data.count > 5) {
            reject(err);
          }
          else {
            setTimeout(() => {
              data.count++;
              this._delete<T>(data).then(resolve).catch(reject);
            }, data.timeout ?? 3000)
          }
        });
    });
  }

  delete<T>(url: string, option?): Promise<T> {
    return this._delete<T>({ url, option, count: 0 });
  }

  private _request<T>(data: { request: string, url: string, option?: any, count: number, timeout?: number }): Promise<T> {
    return new Promise((resolve, reject) => {
      this.http.request<T>(data.request, data.url, data.option).toPromise()
        .then((res: any) => resolve(res))
        .catch(err => {
          if (data.count > 5) {
            reject(err);
          }
          else {
            setTimeout(() => {
              data.count++;
              this._delete<T>(data).then(resolve).catch(reject);
            }, data.timeout ?? 3000)
          }
        });
    });
  }

  request<T>(request: string, url: string, option?): Promise<T> {
    return this._request<T>({
      request, url, option, count: 0
    })
  }
}
