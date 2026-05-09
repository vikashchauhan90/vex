import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VexCollection, VexItem, VexRequest, CollectionTreeNode } from '../models/vex-types';
import { VexParserService } from './vex-parser.service';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private currentCollection$ = new BehaviorSubject<VexCollection | null>(null);
  private collections$ = new BehaviorSubject<VexCollection[]>([]);
  private selectedItem$ = new BehaviorSubject<VexItem | null>(null);

  constructor(
    private parser: VexParserService,
    private electron: ElectronService
  ) {}

  // Observable getters
  getCurrentCollection(): Observable<VexCollection | null> {
    return this.currentCollection$.asObservable();
  }

  getCollections(): Observable<VexCollection[]> {
    return this.collections$.asObservable();
  }

  getSelectedItem(): Observable<VexItem | null> {
    return this.selectedItem$.asObservable();
  }

  // Current collection management
  setCurrentCollection(collection: VexCollection): void {
    this.currentCollection$.next(collection);
  }

  createNewCollection(name: string): VexCollection {
    const collection = this.parser.createNewCollection(name);
    this.currentCollection$.next(collection);
    return collection;
  }

  // Item management
  addRequest(request: VexRequest, parentUid?: string): void {
    const collection = this.currentCollection$.value;
    if (!collection) return;

    const item: VexItem = {
      uid: request.uid,
      name: request.name,
      type: 'http-request',
      request
    };

    if (parentUid) {
      const parent = this.findItem(collection, parentUid);
      if (parent && parent.type === 'folder') {
        if (!parent.items) parent.items = [];
        parent.items.push(item);
      }
    } else {
      collection.items.push(item);
    }

    this.currentCollection$.next(collection);
  }

  addFolder(name: string, parentUid?: string): void {
    const collection = this.currentCollection$.value;
    if (!collection) return;

    const item = this.parser.createNewFolder(name);

    if (parentUid) {
      const parent = this.findItem(collection, parentUid);
      if (parent && parent.type === 'folder') {
        if (!parent.items) parent.items = [];
        parent.items.push(item);
      }
    } else {
      collection.items.push(item);
    }

    this.currentCollection$.next(collection);
  }

  updateRequest(uid: string, request: Partial<VexRequest>): void {
    const collection = this.currentCollection$.value;
    if (!collection) return;

    const item = this.findItem(collection, uid);
    if (item && item.request) {
      item.request = { ...item.request, ...request };
      this.currentCollection$.next(collection);
    }
  }

  deleteItem(uid: string): void {
    const collection = this.currentCollection$.value;
    if (!collection) return;

    this.removeItem(collection.items, uid);
    this.currentCollection$.next(collection);
  }

  selectItem(uid: string): void {
    const collection = this.currentCollection$.value;
    if (!collection) return;

    const item = this.findItem(collection, uid);
    this.selectedItem$.next(item || null);
  }

  // File operations
  async openCollection(collectionPath: string): Promise<void> {
    try {
      const content = await this.electron.readFile(collectionPath);
      const collection = this.parser.parseVexFile(content);
      this.setCurrentCollection(collection);
    } catch (error) {
      console.error('Error opening collection:', error);
    }
  }

  async saveCollection(collectionPath: string): Promise<void> {
    const collection = this.currentCollection$.value;
    if (!collection) return;

    try {
      const content = this.parser.serializeToVexFormat(collection);
      await this.electron.writeFile(collectionPath, content);
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  }

  // Utility methods
  private findItem(collection: VexCollection, uid: string): VexItem | undefined {
    for (const item of collection.items) {
      if (item.uid === uid) return item;
      if (item.items) {
        const found = this.findItemInArray(item.items, uid);
        if (found) return found;
      }
    }
    return undefined;
  }

  private findItemInArray(items: VexItem[], uid: string): VexItem | undefined {
    for (const item of items) {
      if (item.uid === uid) return item;
      if (item.items) {
        const found = this.findItemInArray(item.items, uid);
        if (found) return found;
      }
    }
    return undefined;
  }

  private removeItem(items: VexItem[], uid: string): boolean {
    const index = items.findIndex(i => i.uid === uid);
    if (index >= 0) {
      items.splice(index, 1);
      return true;
    }

    for (const item of items) {
      if (item.items && this.removeItem(item.items, uid)) {
        return true;
      }
    }
    return false;
  }

  buildTreeNode(item: VexItem, path: string = ''): CollectionTreeNode {
    return {
      ...item,
      path: `${path}/${item.name}`,
      isExpanded: item.type === 'folder',
      children: item.items?.map((child, index) =>
        this.buildTreeNode(child, `${path}/${item.name}`)
      )
    };
  }
}
