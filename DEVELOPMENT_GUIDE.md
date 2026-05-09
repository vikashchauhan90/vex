## VEX Development Guide

This guide helps developers extend and maintain VEX codebase.

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         AppComponent (Main)             │
├─────────────────────────────────────────┤
│  CollectionTree  │  Editor  │ Response  │
├─────────────────────────────────────────┤
│ Services (RxJS State Management)        │
│  • CollectionService                    │
│  • RequestExecutorService               │
│  • VexParserService                     │
│  • ElectronService                      │
├─────────────────────────────────────────┤
│ Electron IPC Bridge                     │
├─────────────────────────────────────────┤
│ File System / HTTP APIs                 │
└─────────────────────────────────────────┘
```

### Folder Structure

```
packages/vex-app/app/src/app/
├── models/
│   └── vex-types.ts           # Data types
├── services/
│   ├── vex-parser.service.ts  # Format parser
│   ├── collection.service.ts  # State management
│   ├── request-executor.service.ts  # HTTP
│   └── electron.service.ts    # File I/O
├── components/
│   ├── collection-tree.component.ts    # Sidebar
│   ├── request-editor.component.ts     # Editor
│   └── response-viewer.component.ts    # Viewer
├── app.component.ts           # Main layout
└── app.config.ts              # Config

packages/vex-electron/
├── main.js                    # Electron main
├── preload.js                 # Context bridge
└── package.json

examples/
└── demo.vex                   # Example file

docs/
├── VEX_FORMAT.md             # Format spec
├── GETTING_STARTED.md        # Quick start
└── IMPLEMENTATION_SUMMARY.md # What's built
```

### Adding a New Feature

#### 1. Add to Data Model

```typescript
// models/vex-types.ts
export interface NewFeature {
  uid: string;
  name: string;
  enabled: boolean;
}

export interface VexRequest {
  // ... existing fields
  newFeature?: NewFeature;
}
```

#### 2. Update Parser

```typescript
// services/vex-parser.service.ts
private serializeRequest(request: VexRequest): string {
  let content = `...`;
  
  if (request.newFeature) {
    content += `\n  newFeature: ${request.newFeature.name}`;
  }
  
  return content;
}
```

#### 3. Add Service Method

```typescript
// services/collection.service.ts
updateNewFeature(uid: string, feature: NewFeature): void {
  const collection = this.currentCollection$.value;
  if (!collection) return;
  
  const item = this.findItem(collection, uid);
  if (item && item.request) {
    item.request.newFeature = feature;
    this.currentCollection$.next(collection);
  }
}
```

#### 4. Create UI Component

```typescript
// components/new-feature.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewFeature } from '../../models/vex-types';

@Component({
  selector: 'app-new-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="new-feature">
      <input [(ngModel)]="feature.name" (change)="emitChange()" />
      <input type="checkbox" [(ngModel)]="feature.enabled" (change)="emitChange()" />
    </div>
  `,
  styles: [`
    .new-feature { /* styles */ }
  `]
})
export class NewFeatureComponent {
  @Input() feature!: NewFeature;
  @Output() change = new EventEmitter<void>();
  
  emitChange(): void {
    this.change.emit();
  }
}
```

#### 5. Integrate in Parent Component

```typescript
// components/request-editor.component.ts
import { NewFeatureComponent } from './new-feature.component';

@Component({
  selector: 'app-request-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NewFeatureComponent  // Add here
  ],
  template: `
    <!-- Add to template -->
    <app-new-feature
      [feature]="selectedItem.request.newFeature"
      (change)="updateRequest()"
    ></app-new-feature>
  `
})
export class RequestEditorComponent {
  // ...
}
```

### Extending VEX Format

Add new sections to `.vex` file format:

```vex
meta {
  name: "Collection"
}

request {
  name: "Request Name"
  method: GET
  url: https://api.example.com
  type: http

  # Existing sections
  headers { ... }
  params { ... }
  body: json ...
  
  # New section
  newSection {
    key: value
    nested {
      key: value
    }
  }
}
```

### Adding IPC Handler

For file operations or Electron features:

```javascript
// packages/vex-electron/main.js
ipcMain.handle('new-operation', async (event, params) => {
  try {
    // Implementation
    return result;
  } catch (error) {
    throw new Error(`Operation failed: ${error.message}`);
  }
});
```

Then use in service:

```typescript
// services/electron.service.ts
async newOperation(params: any): Promise<any> {
  if (!this.isElectron()) {
    throw new Error('Electron not available');
  }
  return this.ipc.invoke('new-operation', params);
}
```

### Best Practices

#### 1. Services
- Keep business logic in services
- Use RxJS observables for state
- Inject dependencies via constructor
- Make services pure and testable

#### 2. Components
- Keep components focused and small
- Use `@Input` and `@Output` for communication
- Subscribe with `takeUntil` for cleanup
- Implement `OnDestroy` to unsubscribe

#### 3. File Format
- Keep `.vex` format simple and readable
- Use plain text (no JSON nesting)
- Support comments with `//`
- Use consistent indentation (2 spaces)

#### 4. Types
- Define all data models in `vex-types.ts`
- Use strict TypeScript modes
- Avoid `any` types
- Use interfaces for extensibility

#### 5. Error Handling
- Catch errors in services
- Emit errors through observables
- Display user-friendly messages
- Log detailed errors to console

### Testing

#### Unit Test Example

```typescript
// collection.service.spec.ts
describe('CollectionService', () => {
  let service: CollectionService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionService);
  });
  
  it('should create', () => {
    expect(service).toBeTruthy();
  });
  
  it('should add request', () => {
    const collection = service.createNewCollection('Test');
    const request = { /* ... */ };
    
    service.addRequest(request);
    
    service.getCurrentCollection().subscribe(col => {
      expect(col.items.length).toBe(1);
    });
  });
});
```

### Debugging

#### Enable Dev Tools
```bash
npm run dev:electron    # Dev tools open automatically
```

#### Console Logging
```typescript
console.log('Message:', data);
console.error('Error:', error);
console.table(array);
```

#### Inspect State
```typescript
this.collectionService.getCurrentCollection().subscribe(col => {
  console.log('Current collection:', col);
});
```

#### Network Debugging
- Open DevTools → Network tab
- Filter requests
- Check headers and response

### Performance Tips

1. **Lazy load** components
2. **Unsubscribe** from observables
3. **Memoize** expensive operations
4. **Use TrackBy** in `*ngFor`
5. **Debounce** user input

### Code Quality

#### ESLint
```bash
npm run lint
```

#### Format Code
```bash
npm run format
```

#### Type Check
```bash
npm run type-check
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Memory leak | Use `takeUntil` on subscriptions |
| Stale data | Use `BehaviorSubject` for state |
| Slow rendering | Use `OnPush` change detection |
| IPC fails | Check preload.js context bridge |
| Format errors | Validate `.vex` parser logic |

### Contributing Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Follow code style
   - Add types
   - Test locally

3. **Commit messages**
   ```
   feat: Add new feature
   fix: Fix bug
   docs: Update docs
   refactor: Reorganize code
   ```

4. **Push and PR**
   ```bash
   git push origin feature/my-feature
   ```

### Resources

- [Angular Docs](https://angular.io/docs)
- [RxJS Guide](https://rxjs.dev/guide/overview)
- [Electron Docs](https://www.electronjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Bruno GitHub](https://github.com/usebruno/bruno)

### Support

For questions or issues:
1. Check existing issues
2. Read documentation
3. Ask in discussions
4. Open new issue if needed

---

Happy coding! 🚀
