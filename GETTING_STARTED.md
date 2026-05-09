## Getting Started with VEX

### Installation & Setup

```bash
# Clone and install
git clone <repo>
cd vex

# Install dependencies
npm install

# Install peer dependencies
cd packages/vex-app/app
npm install uuid
cd ../../../

# Run setup script
npm run setup
```

### Development

**Terminal 1 - Start Angular dev server:**
```bash
npm run dev:web
# Opens http://localhost:4200
```

**Terminal 2 - Start Electron app:**
```bash
npm run dev:electron
```

Or combined (requires concurrently):
```bash
npm run dev
```

### Building

```bash
# Build Angular app
npm run build:web

# Build Electron app  
npm run build:electron
```

### Project Architecture

**Frontend (Angular)**
- Standalone components
- RxJS for state management
- TypeScript strict mode
- Services for business logic

**Backend (Electron)**
- IPC for secure file operations
- Preload script for context isolation
- File system access

**Data Storage**
- `.vex` files on user's filesystem
- Plain text format (git-friendly)
- No cloud sync (offline-first)

---

## Using VEX

### Create a Collection

1. Click "Create Collection" button in empty state
2. Enter collection name
3. Add requests using the "+" button

### Add a Request

1. Click "+" button in collection sidebar
2. Edit request name, method, URL
3. Add headers, params, body as needed
4. Click "Send" to execute

### Edit Request

- **Method & URL**: Change in the top editor
- **Headers**: Click "Headers" tab, add/edit/delete
- **Query Params**: Click "Params" tab
- **Body**: Click "Body" tab, select mode (JSON/XML/text)
- **Auth**: Click "Auth" tab for Bearer/Basic auth

### Execute Request

1. Click "Send" button
2. Wait for response
3. View in right panel:
   - **Body**: Response content
   - **Headers**: Response headers
   - **Timeline**: Timing & size

### Organize with Folders

1. Click "📁" button to create folder
2. Drag requests into folders (if implemented)
3. Expand/collapse folders with arrows

### Save Collection

```bash
# Via UI (coming soon)
1. File → Save As
2. Choose location
3. Select .vex file

# Or manually create .vex file with format:
meta {
  name: "My Collection"
}

request {
  name: "Get API"
  method: GET
  url: https://api.example.com
  type: http

  headers {
    Accept: application/json
  }
}
```

---

## VEX File Format

### Basic Structure

```vex
meta {
  name: "Collection Name"
  desc: "Optional description"
}

request {
  name: "Request Name"
  method: GET
  url: https://api.example.com/endpoint
  type: http

  headers {
    Header-Name: value
    // Disabled: commented-header-value
  }

  params {
    param_name: param_value
  }

  body: json
  {
    "json": "body"
  }

  auth: bearer token_value
}

---

request {
  name: "Another Request"
  ...
}
```

### Sections

| Section | Purpose | Example |
|---------|---------|---------|
| `meta` | Collection metadata | `name: "My APIs"` |
| `request` | API request | Method, URL, headers |
| `name` | Request name | `name: "Get Users"` |
| `method` | HTTP method | `GET`, `POST`, `PUT`, etc |
| `url` | Request URL | `https://api.example.com/users` |
| `type` | Request type | `http` or `graphql` |
| `headers` | HTTP headers | Key: value pairs |
| `params` | Query parameters | Key: value pairs |
| `body` | Request body | Mode: `json`, `text`, `xml` |
| `auth` | Authentication | `bearer token`, `basic user:pass` |

### Variables

Use `{{VARIABLE_NAME}}` for interpolation:

```vex
headers {
  Authorization: Bearer {{AUTH_TOKEN}}
}

params {
  user_id: {{USER_ID}}
}
```

### Comments

Use `//` to disable headers/params:

```vex
headers {
  X-Custom-Header: value
  // X-Disabled-Header: value
}
```

---

## Services & APIs

### VexParserService

```typescript
constructor(private parser: VexParserService) {}

// Parse .vex content to collection
const collection = this.parser.parseVexFile(vexContent);

// Serialize collection to .vex content
const vexContent = this.parser.serializeToVexFormat(collection);

// Create new collection
const collection = this.parser.createNewCollection('My API');

// Create new request
const request = this.parser.createNewRequest('GET Users');

// Create new folder
const folder = this.parser.createNewFolder('API Endpoints');
```

### CollectionService

```typescript
constructor(private collections: CollectionService) {}

// Get current collection as observable
this.collections.getCurrentCollection().subscribe(col => {...});

// Set collection
this.collections.setCurrentCollection(collection);

// Add request
this.collections.addRequest(request);

// Add folder
this.collections.addFolder('Folder Name');

// Update request
this.collections.updateRequest(requestId, { url: 'new-url' });

// Delete item
this.collections.deleteItem(itemId);

// Select item
this.collections.selectItem(itemId);

// Save to file
await this.collections.saveCollection('/path/to/file.vex');

// Load from file
await this.collections.openCollection('/path/to/file.vex');
```

### RequestExecutorService

```typescript
constructor(private executor: RequestExecutorService) {}

// Execute request
const response = await this.executor.executeRequest(request, variables);

// Get response as observable
this.executor.getResponse().subscribe(response => {
  console.log(response.statusCode, response.body);
});

// Get loading state
this.executor.getLoading().subscribe(loading => {
  console.log('Loading:', loading);
});

// Get error
this.executor.getError().subscribe(error => {
  console.log('Error:', error);
});
```

### ElectronService

```typescript
constructor(private electron: ElectronService) {}

// File operations
const content = await this.electron.readFile(path);
await this.electron.writeFile(path, content);
await this.electron.createDirectory(path);
await this.electron.deleteFile(path);
const exists = await this.electron.fileExists(path);

// Directory operations
const files = await this.electron.readDirectory(path);

// File dialogs
const dirPath = await this.electron.selectDirectory();
const filePath = await this.electron.selectFile([
  { name: 'VEX Files', extensions: ['vex'] }
]);
```

---

## Common Tasks

### Import External API

1. Open `.vex` file in text editor
2. Add request blocks
3. Open in VEX via File → Open
4. Requests appear in sidebar

### Export Collection

1. Right-click collection → Export
2. Choose format (JSON, CSV, etc)
3. Save file

### Share Collection

1. Commit `.vex` file to Git
2. Team members clone repo
3. Open collection in VEX
4. All requests available

### Use Authentication Token

```vex
request {
  name: "Get Protected API"
  method: GET
  url: https://api.example.com/protected
  
  headers {
    Authorization: Bearer {{AUTH_TOKEN}}
  }
  
  auth: bearer {{AUTH_TOKEN}}
}
```

Then set `AUTH_TOKEN` variable before sending.

### Chain Requests

```vex
request {
  name: "Get User"
  method: GET
  url: https://api.example.com/user/1

  script {
    res {
      // Extract user ID for next request
      bru.setVar('USER_ID', res.body.id);
    }
  }
}

---

request {
  name: "Get User Posts"
  method: GET
  url: https://api.example.com/users/{{USER_ID}}/posts
}
```

---

## Keyboard Shortcuts (Planned)

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New request |
| `Ctrl+S` | Save collection |
| `Ctrl+O` | Open collection |
| `Ctrl+L` | Focus URL bar |
| `Ctrl+Enter` | Send request |
| `Ctrl+K` | Command palette |

---

## Tips & Tricks

1. **Organize with folders** - Use folders to group related requests
2. **Use variables** - Define common values once, reuse everywhere
3. **Version control** - Commit `.vex` files to Git for team collaboration
4. **Disable endpoints** - Use `//` to comment out headers/params
5. **Format responses** - JSON and XML are auto-formatted
6. **Copy as cURL** - Right-click request for cURL command (coming soon)

---

## Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
npm run clean
npm install
npm run setup
```

### Electron won't open
```bash
# Check if development server is running on port 4200
npm run dev:web    # Run this first

# Then in another terminal
npm run dev:electron
```

### Can't read files
- Check file permissions
- Ensure path is correct
- Verify `.vex` file format is valid

### Request fails
- Check URL is correct
- Verify network connection
- Check headers and authentication
- Look at response error message

---

## Support

For issues and feature requests, please open a GitHub issue.
