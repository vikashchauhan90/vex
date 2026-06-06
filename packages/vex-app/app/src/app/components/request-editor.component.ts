import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../services/collection.service';
import { RequestExecutorService } from '../services/request-executor.service';
import { VexRequest, KeyValue } from 'vex-common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { KeyValueEditorComponent } from './key-value-editor.component';

@Component({
  selector: 'app-request-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValueEditorComponent],
  template: `
    <div class="request-editor" *ngIf="selectedItem && selectedItem.request">
      <div class="editor-header">
        <input
          [(ngModel)]="selectedItem.name"
          class="request-name"
          placeholder="Request name"
          (change)="updateRequest()"
        />
        <button (click)="executeRequest()" class="btn-send" [disabled]="isLoading">
          {{ isLoading ? 'Sending...' : 'Send' }}
        </button>
      </div>

      <div class="request-form">
        <!-- Method & URL -->
        <div class="form-group">
          <label>Method & URL</label>
          <div class="method-url">
            <select [(ngModel)]="selectedItem.request.method" (change)="updateRequest()" class="method-select">
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
              <option>HEAD</option>
              <option>OPTIONS</option>
            </select>
            <input
              [(ngModel)]="selectedItem.request.url"
              type="text"
              class="url-input"
              placeholder="https://api.example.com/endpoint"
              (change)="updateRequest()"
            />
          </div>
        </div>

        <!-- Tabs -->
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

        <!-- Headers -->
        <div *ngIf="activeTab === 'Headers'" class="tab-content">
          <app-key-value-editor
            [pairs]="selectedItem.request.headers"
            (change)="updateRequest()"
          ></app-key-value-editor>
        </div>

        <!-- Params -->
        <div *ngIf="activeTab === 'Params'" class="tab-content">
          <app-key-value-editor
            [pairs]="selectedItem.request.params"
            (change)="updateRequest()"
          ></app-key-value-editor>
        </div>

        <!-- Body -->
        <div *ngIf="activeTab === 'Body'" class="tab-content">
          <div class="body-mode">
            <select [(ngModel)]="selectedItem.request.body!.mode" (change)="updateRequest()" class="mode-select">
              <option value="none">None</option>
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="xml">XML</option>
              <option value="formUrlEncoded">Form URL Encoded</option>
            </select>
          </div>
          <textarea
            *ngIf="selectedItem.request.body!.mode !== 'none'"
            [(ngModel)]="selectedItem.request.body!.text"
            class="body-textarea"
            placeholder="Request body"
            (change)="updateRequest()"
          ></textarea>
        </div>

        <!-- Auth -->
        <div *ngIf="activeTab === 'Auth'" class="tab-content">
          <div class="auth-mode">
            <select [(ngModel)]="selectedItem.request.auth!.mode" (change)="updateRequest()" class="mode-select">
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
            </select>
          </div>
          <div *ngIf="selectedItem.request.auth!.mode === 'bearer'" class="auth-input">
            <label>Token</label>
            <input
              [(ngModel)]="selectedItem.request.auth!.bearer!.token"
              type="text"
              placeholder="Enter token"
              (change)="updateRequest()"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!selectedItem">
      <p>Select a request to edit</p>
    </div>
  `,
  styles: [`
    .request-editor {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .editor-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .request-name {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
    }

    .btn-send {
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }

    .btn-send:hover:not(:disabled) {
      background: #059669;
    }

    .btn-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .request-form {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #374151;
    }

    .method-url {
      display: flex;
      gap: 8px;
    }

    .method-select,
    .url-input,
    .mode-select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
      font-family: monospace;
    }

    .method-select {
      width: 100px;
    }

    .url-input {
      flex: 1;
    }

    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 16px;
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
      margin-bottom: 16px;
    }

    .body-textarea {
      width: 100%;
      height: 200px;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      resize: vertical;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9ca3af;
    }

    .auth-input,
    .body-mode {
      margin-bottom: 12px;
    }

    .auth-input label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 4px;
      display: block;
    }

    .auth-input input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 13px;
    }
  `]
})
export class RequestEditorComponent implements OnInit, OnDestroy {
  selectedItem: any = null;
  activeTab = 'Headers';
  tabs = ['Headers', 'Params', 'Body', 'Auth'];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private collectionService: CollectionService,
    private executor: RequestExecutorService
  ) {}

  ngOnInit(): void {
    this.collectionService.getSelectedItem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((item: any) => {
        this.selectedItem = item;
      });

    this.executor.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading: boolean) => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateRequest(): void {
    if (this.selectedItem && this.selectedItem.request) {
      this.collectionService.updateRequest(this.selectedItem.uid, this.selectedItem.request);
    }
  }

  async executeRequest(): Promise<void> {
    if (this.selectedItem && this.selectedItem.request) {
      await this.executor.executeRequest(this.selectedItem.request);
    }
  }
}
