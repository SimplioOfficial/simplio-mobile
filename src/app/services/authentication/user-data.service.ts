import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { USERS_URLS } from '../../providers/routes/account.routes';
import { AGREEMENTS_URL } from '../../providers/routes/swap.routes';
import { HttpFallbackService } from '../apiv2/connection/http-fallback.service';

export interface UserDataItem {
  ETag: string;
  Name: string;
  PartitionKey: string;
  RowKey: string;
  Timestamp: string;
  Type: string;
  UpdatedAt: string;
  UserId: string;
  Value: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(private http: HttpFallbackService) { }

  get(property: string): Promise<any> {
    const url = USERS_URLS.data.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get<UserDataItem[]>(url, { headers }).then(res => res.find(a => a.Name === property)?.Value);
  }

  create(name: string, type: string, value: any): Promise<any> {
    const url = USERS_URLS.data.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = {
      name,
      type,
      value,
    };

    return this.http.post<any>(url, body, { headers });
  }

  update(name: string, type: string, value: string): Promise<any> {
    const url = USERS_URLS.data.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = {
      name,
      type,
      value,
    };

    return this.http.put<any>(url, body, { headers });
  }

  remove(name: string): Promise<any> {
    const url = `${USERS_URLS.data.href}/${name}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.delete<any>(url, { headers });
  }

  initializeAdvertising(advertising: boolean): Promise<any> {
    const url = AGREEMENTS_URL.agreements.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(url, { advertising }, { headers });
  }

  updateAdvertising(advertising: boolean): Promise<any> {
    const url = AGREEMENTS_URL.agreements.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.put(url, { advertising }, { headers });
  }

  getAdvertising(): Promise<boolean> {
    const url = AGREEMENTS_URL.agreements.href;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get<any>(url, { headers }).then(res => res.Advertising);
  }
}
