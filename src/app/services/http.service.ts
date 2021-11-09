import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { PlatformProvider } from '../providers/platform/platform';
import { timeout } from 'rxjs/operators';
import { AuthenticationProvider } from '../providers/data/authentication.provider';
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private http: HTTP,
    private httpClient: HttpClient,
    private plt: PlatformProvider,
    private authProvider: AuthenticationProvider,
  ) {
    this.setDataSerializer('json');
  }

  getHttpHeaders = (contentType?: string, accessToken?: boolean) => {
    let headers;
    if (contentType === 'text/html') {
      this.setDataSerializer('utf8');
    } else {
      if (!contentType) contentType = 'application/json';
      this.setDataSerializer('json');
    }
    if (!this.plt.isCordova) {
      headers = new HttpHeaders({
        'Content-Type': contentType,
      });
    } else {
      headers = {
        'Content-Type': contentType,
      };
      if (accessToken)
        headers.Authorization = [
          this.authProvider.accountValue.tkt,
          this.authProvider.accountValue.atk,
        ].join(' ');
    }
    return headers;
  };

  post<T>(
    url: string,
    body,
    options?: {
      headers?;
      params?;
    },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.plt.isCordova) {
        const p = data => {
          try {
            return JSON.parse(data);
          } catch (_) {
            return [];
          }
        };
        this.http.setRequestTimeout(10);
        this.http
          .post(url, body, options?.headers ? options?.headers : {})
          .then(data => resolve(p(data.data)))
          .catch(error => reject(error));
      } else {
        this.httpClient
          .post(url, body, options)
          .pipe(timeout(10000))
          .subscribe(
            response => {
              resolve(response as T);
            },
            xhr => {
              reject(xhr);
            },
          );
      }
    });
  }

  get<T>(
    url: string,
    options?: {
      headers?;
      params?;
    },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.plt.isCordova) {
        this.http.setRequestTimeout(10);
        this.http
          .get(
            url,
            options?.params ? options?.params : {},
            options?.headers ? options?.headers : {},
          )
          .then(res => {
            resolve(JSON.parse(res.data));
          })
          .catch(err => reject(err));
      } else {
        this.httpClient
          .get(url, options)
          .pipe(timeout(10000))
          .subscribe(
            response => {
              resolve(response as T);
            },
            xhr => {
              reject(xhr);
            },
          );
      }
    });
  }

  put<T>(
    url: string,
    body,
    options?: {
      headers?;
      params?;
    },
  ): Promise<void> {
    if (this.plt.isCordova) {
      this.http.setRequestTimeout(10);
      return this.http.put(url, body, options?.headers ? options?.headers : {}).then(console.log);
    } else {
      return this.httpClient
        .put(url, body, options)
        .toPromise()
        .then(console.log)
        .catch((err: HttpErrorResponse) => {
          console.error('Updating swap transaction has failed', err);
          throw err;
        });
    }
  }

  request<T>(
    command: string,
    url,
    options?: {
      headers?;
      params?;
      body?;
    },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // if (this.plt.isCordova) {
      //   if (command === 'DELETE') {
      //     this.http
      //       .delete(url, options?.params ?? {}, options?.headers ?? {})
      //       .then(res => {
      //         resolve(JSON.parse(res.data));
      //       })
      //       .catch(err => reject(err));
      //   }
      //   else {
      //     this.httpClient.request(command, url, options).subscribe(
      //       response => {
      //         resolve(response as T);
      //       },
      //       xhr => {
      //         reject(xhr);
      //       }
      //     );
      //   }
      // } else {
      //   this.httpClient.request(command, url, options).subscribe(
      //     response => {
      //       resolve(response as T);
      //     },
      //     xhr => {
      //       reject(xhr);
      //     }
      //   );
      // }
      this.httpClient
        .request(command, url, options)
        .pipe(timeout(10000))
        .subscribe(
          response => {
            resolve(response as T);
          },
          xhr => {
            reject(xhr);
          },
        );
    });
  }

  delete<T>(url, headers) {
    return new Promise((resolve, reject) => {
      this.httpClient
        .delete(url, { headers })
        .pipe(timeout(20000))
        .subscribe(
          response => {
            resolve(response);
          },
          xhr => {
            reject(xhr);
          },
        );
    });
  }

  setDataSerializer(serializer: 'urlencoded' | 'json' | 'utf8' | 'multipart' | 'raw') {
    if (this.plt.isCordova) {
      this.http.setDataSerializer(serializer);
    }
  }
}
