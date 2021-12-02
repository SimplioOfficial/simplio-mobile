import { Injectable } from '@angular/core';
import { KYC_URLS } from '../providers/routes/account.routes';
import { HttpService } from './http.service';

export interface SumSubTokenResponse {
  token: string;
  userId: string;
}

export interface Name {
  firstName: string;
  lastName: string;
}

export interface EnglishName extends Name {
  firstNameEn: string;
  lastNameEn: string;
}

export interface Document extends EnglishName {
  idDocType: string;
  country: string;
  validUntil: Date;
  number: string;
  dob: Date;
  mrzLine1: string;
  mrzLine2: string;
  mrzLine3: string;
}

export interface SumSubApplicant {
  id: string;
  createdAt: Date;
  clientId: string;
  inspectionId: string;
  externalUserId: string;
  fixedInfo: Name;
  info: {
    dob: Date;
    country: string;
    idDocs: Document[];
  } & EnglishName;
  agreement: {
    createdAt: Date;
    source: string;
    targets: string[];
  };
  email: string;
  applicantPlatform: string;
  requiredIdDocs: {
    docSets: {
      idDocSetType: string;
      types: string[];
    }[];
  };
  review: {
    elapsedSincePendingMs: number;
    elapsedSinceQueuedMs: number;
    reprocessing: boolean;
    levelName: string;
    createDate: Date;
    reviewDate: Date;
    startDate: Date;
    reviewResult: {
      reviewAnswer: string;
    };
    reviewStatus: string;
  };
  lang: string;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class KycService {
  constructor(private http: HttpService) {}

  getSumSubToken(): Promise<SumSubTokenResponse> {
    const url = KYC_URLS.sumsubToken.href;
    const headers = this.http.getHttpHeaders('application/json', true);

    return this.http.get<any>(url, { headers });
  }

  getSumSubApplicant(): Promise<SumSubApplicant> {
    const url = KYC_URLS.sumsubApplicant.href;
    const headers = this.http.getHttpHeaders('application/json', true);

    return this.http.get<any>(url, { headers });
  }

  getVerificationsRecords(): Promise<any[]> {
    const url = KYC_URLS.verificationsRecors.href;
    const headers = this.http.getHttpHeaders('application/json', true);

    return this.http.get<any>(url, { headers });
  }
}
