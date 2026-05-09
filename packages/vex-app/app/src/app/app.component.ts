import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionTreeComponent } from './components/collection-tree.component';
import { RequestEditorComponent } from './components/request-editor.component';
import { KeyValueEditorComponent } from './components/key-value-editor.component';
import { ResponseViewerComponent } from './components/response-viewer.component';
import { CollectionService } from './services/collection.service';
import { VexParserService } from './services/vex-parser.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CollectionTreeComponent,
    RequestEditorComponent,
    KeyValueEditorComponent,
    ResponseViewerComponent
  ],
  template: `
    <div class="app-container">
      <div class="topbar">
        <div class="branding">
          <span class="logo">VEX</span>
          <span class="subtitle">API Testing Client</span>
        </div>
        <div class="topbar-actions">
          <button (click)="newCollection()" class="btn-topbar">📄 New Collection</button>
          <button (click)="openCollection()" class="btn-topbar">📂 Open</button>
          <button (click)="saveCollection()" class="btn-topbar">💾 Save</button>
        </div>
      </div>

      <div class="main-container">
        <div class="sidebar">
          <app-collection-tree></app-collection-tree>
        </div>

        <div class="content">
          <div class="editor-panel">
            <app-request-editor></app-request-editor>
          </div>
          <div class="response-panel">
            <app-response-viewer></app-response-viewer>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f3f4f6;
    }

    .topbar {
      background: #1f2937;
      color: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #111827;
    }

    .branding {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #3b82f6;
    }

    .subtitle {
      font-size: 12px;
      color: #9ca3af;
      margin-left: 8px;
      border-left: 1px solid #374151;
      padding-left: 8px;
    }

    .topbar-actions {
      display: flex;
      gap: 8px;
    }

    .btn-topbar {
      background: #374151;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
    }

    .btn-topbar:hover {
      background: #4b5563;
    }

    .main-container {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidebar {
      width: 280px;
      background: white;
      overflow: hidden;
    }

    .content {
      flex: 1;
      display: flex;
      gap: 0;
    }

    .editor-panel {
      flex: 1;
      background: white;
      overflow: hidden;
    }

    .response-panel {
      flex: 1;
      background: white;
      overflow: hidden;
      border-left: 1px solid #e5e7eb;
    }
  `]
})
export class AppComponent {
  constructor(
    private collectionService: CollectionService,
    private parser: VexParserService
  ) {
    // Initialize with a demo collection
    this.initDemo();
  }

  private initDemo(): void {
    const demoCollection = this.parser.createNewCollection('Demo Collection');
    const demoRequest = this.parser.createNewRequest('GET Example');
    demoRequest.url = 'https://jsonplaceholder.typicode.com/posts/1';
    demoRequest.method = 'GET';

    demoCollection.items.push({
      uid: demoRequest.uid,
      name: demoRequest.name,
      type: 'http-request',
      request: demoRequest
    });

    this.collectionService.setCurrentCollection(demoCollection);
  }

  newCollection(): void {
    const name = prompt('Enter collection name:', 'New Collection');
    if (name) {
      this.collectionService.createNewCollection(name);
    }
  }

  openCollection(): void {
    alert('File opening feature coming soon. Use Electron to implement file dialogs.');
  }

  saveCollection(): void {
    alert('Save feature coming soon. Use Electron to implement file operations.');
  }
}
