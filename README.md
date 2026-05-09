# VEX - API Testing IDE

A modern, offline-first API testing client similar to Bruno, built with **Angular** and **Electron**.

Collections are stored locally on your filesystem using the `.vex` file format - a plain text markup language for API requests.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup
npm run setup
```

### Development

```bash
# Start Angular dev server (http://localhost:4200)
npm run dev:web

# In another terminal, start Electron
npm run dev:electron

# Or use combined dev mode
npm run dev
```

### Building

```bash
# Build Angular app
npm run build:web

# Build Electron app
npm run build:electron
```

## ✨ Features

- ✅ **Local Storage** - Collections stored on your filesystem
- ✅ **VEX Format** - Plain text, git-friendly markup language
- ✅ **HTTP Requests** - GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- ✅ **Request Building** - Headers, query parameters, request body
- ✅ **Authentication** - Bearer token, Basic auth support
- ✅ **Response Viewer** - Formatted responses with syntax highlighting
- ✅ **Collection Management** - Organize requests in folders
- ✅ **Variables** - Environment and request-level variables
- ✅ **Pre/Post Scripts** - Custom logic before/after requests
- ✅ **Offline** - Works completely offline, no cloud sync

## 📝 VEX Format Example

```vex
meta {
  name: "My API Collection"
  desc: "Testing my API"
}

request {
  name: "Get Users"
  method: GET
  url: https://api.example.com/users
  type: http

  headers {
    Authorization: Bearer {{AUTH_TOKEN}}
    Content-Type: application/json
  }

  params {
    limit: 10
  }
}

---

request {
  name: "Create User"
  method: POST
  url: https://api.example.com/users
  type: http

  headers {
    Authorization: Bearer {{AUTH_TOKEN}}
    Content-Type: application/json
  }

  body: json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

[See full VEX Format specification →](packages/vex-app/app/VEX_FORMAT.md)

## 📁 Project Structure

```
vex/
├── packages/
│   ├── vex-app/              # Angular frontend
│   │   └── app/
│   │       └── src/app/
│   │           ├── models/       # VEX types & interfaces
│   │           ├── services/     # Business logic
│   │           └── components/   # UI components
│   │
│   └── vex-electron/         # Electron wrapper
│       ├── main.js           # Main process (file operations)
│       ├── preload.js        # Context bridge
│       └── package.json
│
├── scripts/
│   ├── setup.js              # Project setup
│   ├── dev.js                # Dev mode
│   ├── dev-hot-reload.js     # Hot reload dev
│   └── build-electron.js     # Electron build
│
└── package.json              # Monorepo config
```

## 🏗️ Architecture

### Frontend Stack
- **Angular 17** - Standalone components
- **RxJS** - Reactive state management
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (via inline styles)

### Backend Stack
- **Electron** - Desktop app framework
- **Node.js** - File system operations
- **IPC** - Secure process communication

### Key Services

| Service | Purpose |
|---------|---------|
| `VexParserService` | Parse/serialize `.vex` files |
| `CollectionService` | Manage collections and requests |
| `RequestExecutorService` | Execute HTTP requests |
| `ElectronService` | File system via IPC |

## 🎯 Core Components

| Component | Purpose |
|-----------|---------|
| `AppComponent` | Main app layout |
| `CollectionTreeComponent` | Sidebar with collection hierarchy |
| `RequestEditorComponent` | Form for editing requests |
| `ResponseViewerComponent` | Display formatted responses |
| `KeyValueEditorComponent` | Headers/params editor |

## 📦 Data Models

```typescript
// Collection
{
  uid: string;
  name: string;
  version: '1.0.0';
  items: VexItem[];
}

// Request
{
  uid: string;
  name: string;
  method: 'GET' | 'POST' | ...;
  url: string;
  type: 'http' | 'graphql';
  headers: KeyValue[];
  params: KeyValue[];
  body?: RequestBody;
  auth?: AuthConfig;
}

// Response
{
  statusCode: number;
  statusText: string;
  headers: { [key: string]: string };
  body: string;
  responseTime: number;
  size: number;
}
```

## 🔄 Development Workflow

### 1. Create/Edit a Request
- Click on a request in the sidebar
- Edit URL, method, headers, params, body in the editor
- Changes auto-save in memory

### 2. Send Request
- Click "Send" button
- Response appears in the right panel
- View body, headers, or timeline

### 3. Save Collection
- Collections can be saved as `.vex` files
- Use File menu to save/open collections

## 🚀 Roadmap

- [ ] GraphQL support with introspection
- [ ] Request history
- [ ] Import from Postman/Insomnia
- [ ] Environments and variables
- [ ] Request/response scripting
- [ ] Test assertions
- [ ] Mock server
- [ ] CI/CD integration
- [ ] Real-time collaboration
- [ ] Request templating
- [ ] Collections sharing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Inspired by [Bruno](https://www.usebruno.com/) - An open-source API client for exploring and testing APIs.

VEX brings the same principles to the Angular ecosystem with the Electron desktop framework.