import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestExecutorService } from '../services/request-executor.service';
import { VexResponse } from 'vex-common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-response-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="response-viewer">
      <div class="response-header" *ngIf="response">
        <div class="status" [ngClass]="getStatusClass(response.statusCode)">
          {{ response.statusCode }} {{ response.statusText }}
        </div>
        <div class="response-meta">
          <span>{{ response.responseTime }}ms</span>
          <span>{{ response.size }} bytes</span>
        </div>
      </div>

      <div class="tabs">
        <button
          *ngFor="let tab of tabs"
          (click)="activeTab = tab"
          [class.active]="activeTab === tab"
          class="tab"
        >
          {{ tab }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Body Tab -->
        <div *ngIf="activeTab === 'Body'" class="body-view">
          <pre *ngIf="response">{{ formatBody(response.body) }}</pre>
          <div *ngIf="!response" class="empty">Send a request to see the response</div>
        </div>

        <!-- Headers Tab -->
        <div *ngIf="activeTab === 'Headers'" class="headers-view">
          <div class="header-row" *ngFor="let header of getHeadersList(response)">
            <span class="header-key">{{ header.key }}</span>
            <span class="header-value">{{ header.value }}</span>
          </div>
          <div *ngIf="!response" class="empty">No headers to display</div>
        </div>

        <!-- Timeline Tab -->
        <div *ngIf="activeTab === 'Timeline'" class="timeline-view">
          <div *ngIf="response" class="timeline-item">
            <span class="timeline-label">Response Time</span>
            <span class="timeline-value">{{ response.responseTime }}ms</span>
          </div>
          <div *ngIf="response" class="timeline-item">
            <span class="timeline-label">Response Size</span>
            <span class="timeline-value">{{ formatSize(response.size) }}</span>
          </div>
          <div *ngIf="!response" class="empty">No timeline data</div>
        </div>
      </div>

      <div class="error-message" *ngIf="error">
        <strong>Error:</strong> {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .response-viewer {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
      border-left: 1px solid #e5e7eb;
    }

    .response-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status {
      font-weight: 600;
      font-size: 13px;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .status.success {
      background: #d1fae5;
      color: #065f46;
    }

    .status.error {
      background: #fee2e2;
      color: #991b1b;
    }

    .status.warning {
      background: #fef3c7;
      color: #92400e;
    }

    .response-meta {
      font-size: 12px;
      color: #6b7280;
      display: flex;
      gap: 16px;
    }

    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .tab {
      background: transparent;
      border: none;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 13px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab:hover {
      background: #f3f4f6;
    }

    .tab.active {
      border-bottom-color: #3b82f6;
      color: #3b82f6;
    }

    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .body-view pre {
      margin: 0;
      padding: 0;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #1f2937;
    }

    .headers-view {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .header-row {
      display: flex;
      padding: 8px;
      background: #f9fafb;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }

    .header-key {
      font-weight: 600;
      font-size: 12px;
      color: #374151;
      width: 150px;
      word-break: break-all;
    }

    .header-value {
      flex: 1;
      font-size: 12px;
      color: #6b7280;
      font-family: monospace;
      word-break: break-all;
    }

    .timeline-view {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .timeline-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }

    .timeline-label {
      font-weight: 600;
      font-size: 13px;
      color: #374151;
    }

    .timeline-value {
      font-size: 13px;
      color: #0284c7;
      font-weight: 600;
    }

    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9ca3af;
      text-align: center;
    }

    .error-message {
      padding: 12px 16px;
      background: #fee2e2;
      color: #991b1b;
      border-top: 1px solid #fecaca;
      font-size: 12px;
    }
  `]
})
export class ResponseViewerComponent implements OnInit, OnDestroy {
  response: VexResponse | null = null;
  error: string | null = null;
  activeTab = 'Body';
  tabs = ['Body', 'Headers', 'Timeline'];
  private destroy$ = new Subject<void>();

  constructor(private executor: RequestExecutorService) {}

  ngOnInit(): void {
    this.executor.getResponse()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: VexResponse | null) => {
        this.response = response;
      });

    this.executor.getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: string | null) => {
        this.error = error;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 400) return 'error';
    return 'warning';
  }

  formatBody(body: string): string {
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return body;
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }

  getHeadersList(response: VexResponse | null): Array<{ key: string; value: string }> {
    if (!response) return [];
    return Object.entries(response.headers as Record<string, string>).map(([key, value]) => ({ key, value }));
  }
}
