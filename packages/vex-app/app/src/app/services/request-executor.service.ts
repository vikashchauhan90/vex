import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VexRequest, VexResponse, KeyValue } from '../models/vex-types';

/**
 * Service to handle HTTP request execution
 */
@Injectable({
  providedIn: 'root'
})
export class RequestExecutorService {
  private response$ = new BehaviorSubject<VexResponse | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor() {}

  getResponse(): Observable<VexResponse | null> {
    return this.response$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  async executeRequest(request: VexRequest, variables?: { [key: string]: string }): Promise<VexResponse> {
    this.loading$.next(true);
    this.error$.next(null);

    try {
      const url = this.interpolateVariables(request.url, variables);
      const headers = this.buildHeaders(request.headers, variables);
      const body = this.buildBody(request.body, variables);

      const startTime = performance.now();

      const fetchOptions: RequestInit = {
        method: request.method,
        headers
      };

      if (body && request.method !== 'GET' && request.method !== 'HEAD') {
        fetchOptions.body = body;
      }

      const response = await fetch(url, fetchOptions);
      const responseBody = await response.text();
      const endTime = performance.now();

      const vexResponse: VexResponse = {
        statusCode: response.status,
        statusText: response.statusText,
        headers: this.headersToObject(response.headers),
        body: responseBody,
        responseTime: Math.round(endTime - startTime),
        size: responseBody.length
      };

      this.response$.next(vexResponse);
      this.loading$.next(false);

      return vexResponse;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      this.error$.next(errorMsg);
      this.loading$.next(false);
      throw error;
    }
  }

  private interpolateVariables(text: string, variables?: { [key: string]: string }): string {
    if (!variables) return text;

    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      result = result.replace(new RegExp(`\\\${${key}}`, 'g'), value);
    }
    return result;
  }

  private buildHeaders(headers: KeyValue[], variables?: { [key: string]: string }): HeadersInit {
    const headersObj: any = {
      'User-Agent': 'VEX/1.0'
    };

    headers
      .filter(h => h.enabled)
      .forEach(h => {
        const value = this.interpolateVariables(h.value, variables);
        headersObj[h.key] = value;
      });

    return new Headers(headersObj);
  }

  private buildBody(body: any, variables?: { [key: string]: string }): string | null {
    if (!body || body.mode === 'none') return null;

    switch (body.mode) {
      case 'json':
        return this.interpolateVariables(body.json || '', variables);
      case 'text':
        return this.interpolateVariables(body.text || '', variables);
      case 'xml':
        return this.interpolateVariables(body.xml || '', variables);
      case 'formUrlEncoded':
        return this.buildFormUrlEncoded(body.formUrlEncoded, variables);
      case 'multipartForm':
        // Multipart form data would need FormData API
        return null;
      default:
        return null;
    }
  }

  private buildFormUrlEncoded(params: KeyValue[] = [], variables?: { [key: string]: string }): string {
    return params
      .filter(p => p.enabled)
      .map(p => {
        const key = encodeURIComponent(p.key);
        const value = encodeURIComponent(this.interpolateVariables(p.value, variables));
        return `${key}=${value}`;
      })
      .join('&');
  }

  private headersToObject(headers: Headers): { [key: string]: string } {
    const obj: { [key: string]: string } = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
}
