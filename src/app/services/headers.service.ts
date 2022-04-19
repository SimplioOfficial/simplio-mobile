
import { Injectable } from '@angular/core';
import { ApiResources, HeaderFlags } from 'src/app/interface/global';

@Injectable({
  providedIn: 'root',
})
export class HeadersService {

  static readonly simplioHeaders = {
    [HeaderFlags.ApiResource]: ApiResources.Simplio,
  }

  static readonly swipeluxHeaders = {
    [HeaderFlags.ApiResource]: ApiResources.Swipelux,
  }

}
