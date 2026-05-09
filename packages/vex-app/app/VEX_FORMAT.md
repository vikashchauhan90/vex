# VEX - API Testing IDE (Angular Version)

A modern, offline-first API testing client similar to Bruno, built with Angular and Electron. Collections are stored locally on your filesystem with the `.vex` file format.

## Features

✅ **Local-First** - Collections stored on your filesystem, no cloud sync  
✅ **VEX Format** - Plain text markup language for API requests  
✅ **Collection Management** - Organize requests in folders  
✅ **HTTP & GraphQL** - Support for multiple API types  
✅ **Request Building** - Headers, params, body, authentication  
✅ **Response Viewer** - Syntax highlighting and formatted display  
✅ **Variables** - Environment variables and request-level variables  
✅ **Pre/Post Scripts** - Run custom logic before/after requests  
✅ **Git-Friendly** - Version control your API collections  

## VEX File Format

Collections are stored as `.vex` files using a simple plain-text markup format:

```vex
meta {
  name: "My API Collection"
  desc: "Testing APIs"
}

request {
  name: "Get Users"
  method: GET
  url: https://api.example.com/users
  type: http

  headers {
    Content-Type: application/json
    Authorization: Bearer {{TOKEN}}
  }

  params {
    limit: 10
    offset: 0
  }
}

---

request {
  name: "Create User"
  method: POST
  url: https://api.example.com/users
  type: http

  headers {
    Content-Type: application/json
    Authorization: Bearer {{TOKEN}}
  }

  body: json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### VEX Format Syntax

```
meta {
  name: "Collection Name"
  desc: "Optional description"
}

request {
  name: "Request Name"
  method: GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS
  url: https://api.example.com/endpoint
  type: http|graphql

  headers {
    // Header name: value
    // Use // to disable a header
    Content-Type: application/json
    Authorization: Bearer {{TOKEN}}
  }

  params {
    // Query param name: value
    param1: value1
    param2: value2
  }

  body: json|xml|text|formUrlEncoded|multipartForm
  {
    "json": "content"
  }

  auth: none|bearer|basic
  bearer {{TOKEN}}

  script {
    req {
      // Pre-request script (JavaScript)
      bru.setVar('TOKEN', 'new-token');
    }
    res {
      // Post-response script
      if (!res.ok) {
        throw new Error('Request failed');
      }
    }
  }

  tests {
    // Test assertions (JavaScript)
    expect(res.status).toBe(200);
  }
}
```

## Project Structure

```
vex/
├── packages/
│   ├── vex-app/              # Angular frontend
│   │   └── app/
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── models/           # TypeScript types
│   │       │   │   ├── services/         # Business logic
│   │       │   │   └── components/       # UI components
│   │       │   ├── index.html
│   │       │   ├── main.ts
│   │       │   ├── styles.css
│   │       │   └── app.config.ts
│   │       └── angular.json
│   │
│   └── vex-electron/         # Electron wrapper
│       ├── main.js           # Electron main process
│       ├── preload.js        # Context bridge
│       └── package.json
│
└── scripts/
    ├── setup.js              # Initialize project
    ├── dev.js                # Development server
    ├── dev-hot-reload.js     # Dev with hot reload
    └── build-electron.js     # Build Electron app
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
npm run setup
```

### 2. Development

Start the Angular dev server:

```bash
npm run dev:web
```

In another terminal, start Electron:

```bash
npm run dev:electron
```

Or use the combined dev server:

```bash
npm run dev
```

### 3. Build

Build the Angular app:

```bash
npm run build:web
```

Build for Electron:

```bash
npm run build:electron
```

## Core Services

### VexParserService
Handles parsing and serialization of `.vex` files.

```typescript
const parser = new VexParserService();
const collection = parser.parseVexFile(vexContent);
const vexContent = parser.serializeToVexFormat(collection);
```

### CollectionService
Manages collections, items, and requests.

```typescript
collectionService.setCurrentCollection(collection);
collectionService.addRequest(request);
collectionService.addFolder('My Folder');
collectionService.deleteItem(uid);
```

### RequestExecutorService
Executes HTTP requests and handles responses.

```typescript
const response = await executor.executeRequest(request);
// { statusCode, statusText, headers, body, responseTime, size }
```

### ElectronService
Bridge for file system operations via IPC.

```typescript
const content = await electron.readFile(path);
await electron.writeFile(path, content);
const dir = await electron.selectDirectory();
```

## UI Components

- **CollectionTreeComponent** - Sidebar with collection hierarchy
- **TreeItemComponent** - Individual item in tree (folder/request)
- **RequestEditorComponent** - Form for editing requests
- **KeyValueEditorComponent** - Headers/params editor
- **ResponseViewerComponent** - Display and format responses

## Key Data Models

```typescript
interface VexCollection {
  uid: string;
  name: string;
  version: '1.0.0';
  items: VexItem[];
}

interface VexItem {
  uid: string;
  name: string;
  type: 'folder' | 'http-request' | 'graphql-request';
  request?: VexRequest;
  items?: VexItem[];
}

interface VexRequest {
  uid: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  type: 'http' | 'graphql';
  headers: KeyValue[];
  params: KeyValue[];
  body?: RequestBody;
  auth?: AuthConfig;
  script?: { req?: string; res?: string };
  tests?: string;
}

interface VexResponse {
  statusCode: number;
  statusText: string;
  headers: { [key: string]: string };
  body: string;
  responseTime: number;
  size: number;
}
```

## Features in Development

- [ ] GraphQL support with schema introspection
- [ ] Request history and replay
- [ ] Collection import (Postman, Insomnia)
- [ ] Environment variables
- [ ] Pre/post request scripts
- [ ] Test assertions and reporting
- [ ] Collaboration features
- [ ] Request templating
- [ ] Mock server support
- [ ] CI/CD integration

## Architecture

### Frontend (Angular)
- Standalone components
- Reactive forms with RxJS
- Service-based architecture
- TypeScript strict mode

### Backend (Electron + Node.js)
- IPC for secure file operations
- Context isolation for security
- Preload script for API exposure

### State Management
- RxJS BehaviorSubjects
- Component subscriptions
- Reactive data flow

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
