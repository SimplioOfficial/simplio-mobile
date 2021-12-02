export enum NewsLevel {
  Info = 'Info',
  Warning = 'Warning',
  Urgent = 'Urgent',
}

export type NewsLinkPreview = {
  Url: string;
  Title: string;
  Description: string;
  Image: string;
  Domain: string;
};

export type NewsItem = {
  Id: string;
  Currency: string;
  CreatedAt: string;
  UpdatedAt: string;
  Level: NewsLevel;
  Title: string;
  Body: string;
  LinkPreviews: NewsLinkPreview[];
};

export type NewsRequestParams = {
  Currencies: string[];
  Page: number;
  Size: number;
};
