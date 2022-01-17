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
      reviewAnswer: string; // TODO: use enum instead
    };
    reviewStatus: string; // TODO: use enum instead
  };
  lang: string;
  type: string;
}

export interface VerificationRecord {
  action: string;
  authority: string;
  createdAt: Date;
  detail: {
    reviewAnswer: string; // TODO: use enum instead
    clientComment?: string;
    moderationComment?: string;
    rejectLabels?: string[];
    reviewRejectType?: string;
  };
  status: string; // TODO: use enum instead
}
