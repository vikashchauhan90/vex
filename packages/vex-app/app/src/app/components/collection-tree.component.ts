import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../services/collection.service';
import { VexParserService } from '../services/vex-parser.service';
import { VexItem, VexCollection } from '../models/vex-types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tree-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tree-item" [style.marginLeft]="(depth * 16) + 'px'">
      <div class="item-row" (click)="toggle()" [class.selected]="isSelected">
        <span class="expand-icon" *ngIf="item.type === 'folder'">
          {{ isExpanded ? '▼' : '▶' }}
        </span>
        <span class="expand-icon" *ngIf="item.type !== 'folder'">
          {{ item.type === 'http-request' ? '📄' : '⚙️' }}
        </span>
        <span class="item-name" (click)="onSelect()">{{ item.name }}</span>
        <span class="item-actions">
          <button (click)="onDelete($event)" class="btn-delete">🗑️</button>
        </span>
      </div>
      <div *ngIf="item.type === 'folder' && isExpanded && item.items">
        <app-tree-item
          *ngFor="let child of item.items"
          [item]="child"
          [depth]="depth + 1"
          (select)="select.emit($event)"
          (delete)="delete.emit($event)"
        ></app-tree-item>
      </div>
    </div>
  `,
  styles: [`
    .tree-item {
      user-select: none;
    }

    .item-row {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .item-row:hover {
      background: #e5e7eb;
    }

    .item-row.selected {
      background: #dbeafe;
      color: #0284c7;
    }

    .expand-icon {
      display: inline-block;
      width: 16px;
      text-align: center;
      font-size: 12px;
    }

    .item-name {
      flex: 1;
      font-size: 13px;
      margin-left: 4px;
    }

    .item-actions {
      display: none;
      gap: 4px;
    }

    .item-row:hover .item-actions {
      display: flex;
    }

    .btn-delete {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 2px 4px;
      font-size: 12px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .btn-delete:hover {
      opacity: 1;
    }
  `]
})
export class TreeItemComponent {
  isExpanded = false;
  isSelected = false;

  @Input() item!: VexItem;
  @Input() depth = 0;
  @Output() select = new EventEmitter<VexItem>();
  @Output() delete = new EventEmitter<string>();

  toggle(): void {
    if (this.item.type === 'folder') {
      this.isExpanded = !this.isExpanded;
    }
  }

  onSelect(event?: Event): void {
    if (event) event.stopPropagation();
    this.isSelected = true;
    this.select.emit(this.item);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.item.uid);
  }
}

@Component({
  selector: 'app-collection-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, TreeItemComponent],
  template: `
    <div class="collection-tree">
      <div class="tree-header">
        <h3>Collections</h3>
        <div class="tree-actions">
          <button (click)="createFolder()" title="New Folder" class="btn-icon">📁</button>
          <button (click)="createRequest()" title="New Request" class="btn-icon">➕</button>
        </div>
      </div>

      <div class="tree-container" *ngIf="collection">
        <div class="collection-root">
          {{ collection.name }}
        </div>
        <div class="items-list">
          <app-tree-item
            *ngFor="let item of collection.items"
            [item]="item"
            [depth]="0"
            (select)="selectItem($event)"
            (delete)="deleteItem($event)"
          ></app-tree-item>
        </div>
      </div>

      <div class="empty-state" *ngIf="!collection">
        <p>No collection loaded</p>
        <button (click)="createNewCollection()" class="btn-primary">Create Collection</button>
      </div>
    </div>
  `,
  styles: [`
    .collection-tree {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .tree-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tree-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .tree-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .btn-icon:hover {
      background: #e5e7eb;
    }

    .tree-container {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .collection-root {
      padding: 8px;
      font-weight: 600;
      font-size: 13px;
      color: #1f2937;
    }

    .items-list {
      margin-top: 4px;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #6b7280;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    .btn-primary:hover {
      background: #2563eb;
    }
  `]
})
export class CollectionTreeComponent implements OnInit, OnDestroy {
  collection: VexCollection | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private collectionService: CollectionService,
    private parser: VexParserService
  ) {}

  ngOnInit(): void {
    this.collectionService.getCurrentCollection()
      .pipe(takeUntil(this.destroy$))
      .subscribe((collection: VexCollection | null) => {
        this.collection = collection;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createRequest(): void {
    if (this.collection) {
      const request = this.parser.createNewRequest();
      this.collectionService.addRequest(request);
    }
  }

  createFolder(): void {
    const name = prompt('Enter folder name:');
    if (name) {
      this.collectionService.addFolder(name);
    }
  }

  selectItem(item: VexItem): void {
    this.collectionService.selectItem(item.uid);
  }

  deleteItem(uid: string): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.collectionService.deleteItem(uid);
    }
  }

  createNewCollection(): void {
    const name = prompt('Enter collection name:', 'My Collection');
    if (name) {
      this.collectionService.createNewCollection(name);
    }
  }
}
