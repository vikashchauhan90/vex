import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KeyValue } from '../models/vex-types';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-key-value-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="key-value-editor">
      <div class="kv-row header">
        <div class="kv-col checkbox"></div>
        <div class="kv-col key">Key</div>
        <div class="kv-col value">Value</div>
        <div class="kv-col actions"></div>
      </div>
      <div class="kv-row" *ngFor="let pair of pairs">
        <div class="kv-col checkbox">
          <input type="checkbox" [(ngModel)]="pair.enabled" (change)="emitChange()" />
        </div>
        <div class="kv-col key">
          <input
            [(ngModel)]="pair.key"
            placeholder="Key"
            (change)="emitChange()"
            class="kv-input"
          />
        </div>
        <div class="kv-col value">
          <input
            [(ngModel)]="pair.value"
            placeholder="Value"
            (change)="emitChange()"
            class="kv-input"
          />
        </div>
        <div class="kv-col actions">
          <button (click)="removePair(pair.uid)" class="btn-remove">−</button>
        </div>
      </div>
      <button (click)="addPair()" class="btn-add">+ Add</button>
    </div>
  `,
  styles: [`
    .key-value-editor {
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .kv-row {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
    }

    .kv-row.header {
      background: #f3f4f6;
      font-weight: 600;
      font-size: 12px;
    }

    .kv-col {
      display: flex;
      align-items: center;
      padding: 8px;
    }

    .kv-col.checkbox {
      width: 40px;
    }

    .kv-col.key,
    .kv-col.value {
      flex: 1;
    }

    .kv-col.actions {
      width: 40px;
    }

    .kv-input {
      width: 100%;
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 2px;
      font-size: 12px;
      font-family: monospace;
    }

    .btn-add,
    .btn-remove {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 12px;
    }

    .btn-add {
      width: 100%;
      padding: 8px;
      border-top: 1px solid #e5e7eb;
      text-align: left;
      color: #0284c7;
    }

    .btn-add:hover {
      background: #f3f4f6;
    }

    .btn-remove {
      color: #ef4444;
    }

    .btn-remove:hover {
      background: #fee2e2;
    }
  `]
})
export class KeyValueEditorComponent {
  @Input() pairs: KeyValue[] = [];
  @Output() change = new EventEmitter<void>();

  addPair(): void {
    this.pairs.push({
      uid: uuidv4(),
      key: '',
      value: '',
      enabled: true
    });
    this.emitChange();
  }

  removePair(uid: string): void {
    const index = this.pairs.findIndex(p => p.uid === uid);
    if (index >= 0) {
      this.pairs.splice(index, 1);
      this.emitChange();
    }
  }

  emitChange(): void {
    this.change.emit();
  }
}
