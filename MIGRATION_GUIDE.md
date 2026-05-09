## VEX Migration Guide

How to import collections from Bruno, Postman, Insomnia, and other API clients.

### Quick Reference

| Source | Format | Status | Method |
|--------|--------|--------|--------|
| **Bruno** | `.bru` | 🟢 Ready | Convert text format |
| **Postman** | `.json` | 🟡 Planned | JSON import |
| **Insomnia** | `.json` | 🟡 Planned | JSON import |
| **cURL** | Command | 🟡 Planned | Parse command |
| **OpenAPI** | `.yaml/.json` | 🟡 Planned | Generate from spec |

---

## From Bruno (.bru) to VEX (.vex)

### Format Comparison

**Bruno (.bru)**
```
meta {
  name: "My Collection"
}

get {
  url: https://api.example.com/users
  auth: bearer {{TOKEN}}
}
```

**VEX (.vex)**
```
meta {
  name: "My Collection"
}

request {
  name: "Get Users"
  method: GET
  url: https://api.example.com/users
  type: http

  auth: bearer {{TOKEN}}
}
```

### Main Differences

| Bruno | VEX |
|-------|-----|
| `get { }` | `request { method: GET }` |
| `post { }` | `request { method: POST }` |
| Implicit method | Explicit `method` field |
| `body { }` | `body: json { }` |
| `auth` implicit | Explicit auth mode |

### Conversion Steps

1. **Export from Bruno**
   - Right-click collection → Export
   - Save as JSON or text
   
2. **Create VEX file**
   ```bash
   touch collection.vex
   ```

3. **Convert format**
   - Extract `meta` section
   - Convert each request:
     ```bru
     get {
       url: ...
     }
     ```
     becomes:
     ```vex
     request {
       method: GET
       url: ...
     }
     ```

4. **Open in VEX**
   - File → Open → collection.vex

### Conversion Tool (Coming Soon)

```typescript
// bruno-to-vex-converter.ts (future)
export function convertBrunoToVex(bruContent: string): string {
  // Parse .bru format
  // Convert to .vex format
  // Return serialized content
}
```

---

## From Postman (.json) to VEX

### Postman Export

1. Click **⚙️ Settings** → **Export Data**
2. Choose **Export as JSON**
3. Save `collection.json`

### Structure Mapping

**Postman JSON**
```json
{
  "info": {
    "name": "My Collection",
    "description": "API Tests"
  },
  "item": [
    {
      "name": "Get Users",
      "request": {
        "method": "GET",
        "url": {
          "raw": "https://api.example.com/users",
          "host": ["api", "example", "com"],
          "path": ["users"]
        },
        "header": [
          { "key": "Authorization", "value": "Bearer {{token}}" }
        ]
      }
    }
  ]
}
```

**VEX Format**
```vex
meta {
  name: "My Collection"
  desc: "API Tests"
}

request {
  name: "Get Users"
  method: GET
  url: https://api.example.com/users
  type: http

  headers {
    Authorization: Bearer {{token}}
  }
}
```

### Import Script (Planned)

```typescript
import { VexParserService } from './services/vex-parser.service';

export function importFromPostman(postmanJson: any): VexCollection {
  const collection = {
    uid: uuidv4(),
    name: postmanJson.info.name,
    version: '1.0.0',
    description: postmanJson.info.description,
    items: []
  };

  postmanJson.item.forEach((item: any) => {
    const request = convertPostmanRequest(item.request);
    collection.items.push({
      uid: uuidv4(),
      name: item.name,
      type: 'http-request',
      request
    });
  });

  return collection;
}

function convertPostmanRequest(pmReq: any): VexRequest {
  return {
    uid: uuidv4(),
    name: pmReq.name || 'Request',
    method: pmReq.method || 'GET',
    url: typeof pmReq.url === 'string' ? pmReq.url : pmReq.url.raw,
    type: 'http',
    headers: (pmReq.header || []).map((h: any) => ({
      uid: uuidv4(),
      key: h.key,
      value: h.value,
      enabled: h.disabled !== true
    })),
    params: (pmReq.url?.query || []).map((q: any) => ({
      uid: uuidv4(),
      key: q.key,
      value: q.value,
      enabled: q.disabled !== true
    })),
    body: convertPostmanBody(pmReq.body),
    auth: convertPostmanAuth(pmReq.auth)
  };
}
```

---

## From Insomnia (.json) to VEX

### Insomnia Export

1. Click **App Menu** → **Export**
2. Choose **Export to file**
3. Save `insomnia.json`

### Structure Example

**Insomnia JSON**
```json
{
  "resources": [
    {
      "_id": "wrk_123",
      "name": "My Workspace",
      "resources": [
        {
          "_id": "req_123",
          "name": "Get Users",
          "method": "GET",
          "url": "https://api.example.com/users",
          "headers": [
            { "name": "Authorization", "value": "Bearer {{token}}" }
          ]
        }
      ]
    }
  ]
}
```

### Conversion (Planned)

```typescript
export function importFromInsomnia(insomniaJson: any): VexCollection {
  const workspace = insomniaJson.resources[0];
  
  return {
    uid: uuidv4(),
    name: workspace.name,
    version: '1.0.0',
    items: workspace.resources
      .filter((r: any) => r.method) // Requests only
      .map((req: any) => ({
        uid: uuidv4(),
        name: req.name,
        type: 'http-request',
        request: {
          uid: uuidv4(),
          name: req.name,
          method: req.method,
          url: req.url,
          type: 'http',
          headers: (req.headers || []).map((h: any) => ({
            uid: uuidv4(),
            key: h.name,
            value: h.value,
            enabled: !h.disabled
          })),
          params: [],
          body: req.body ? { mode: 'json', text: req.body } : undefined
        }
      }))
  };
}
```

---

## From cURL to VEX

### cURL Example

```bash
curl -X POST https://api.example.com/users \
  -H "Authorization: Bearer token123" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

### Convert to VEX

```vex
request {
  name: "Create User"
  method: POST
  url: https://api.example.com/users
  type: http

  headers {
    Authorization: Bearer token123
    Content-Type: application/json
  }

  body: json
  {
    "name": "John",
    "email": "john@example.com"
  }
}
```

### Parser (Planned)

```typescript
export function parseCurl(curlCommand: string): VexRequest {
  // Parse: -X METHOD, -H "header", -d 'body', URL
  // Return VexRequest object
}
```

---

## From OpenAPI/Swagger

### OpenAPI Example

```yaml
openapi: 3.0.0
info:
  title: My API
paths:
  /users:
    get:
      summary: Get all users
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Success
```

### Generate VEX Collection (Planned)

```typescript
export function generateFromOpenAPI(specUrl: string): VexCollection {
  // Fetch OpenAPI spec
  // Generate requests for each endpoint
  // Create VEX collection
  // Return collection
}
```

---

## Manual Conversion Steps

If you prefer to manually convert:

### 1. Extract Collection Info

```vex
meta {
  name: "Original Collection Name"
  desc: "Description"
}
```

### 2. List All Requests

For each request in source:

```vex
request {
  name: "Request Name"
  method: GET|POST|PUT|DELETE|...
  url: https://...
  type: http

  headers {
    Header-Name: value
  }

  params {
    param: value
  }

  body: json
  {
    "json": "body"
  }

  auth: bearer|basic token
}

---
```

### 3. Handle Variables

Replace:
- `{{variable}}` → `{{VARIABLE}}`
- `$env.var` → `{{ENV_VAR}}`
- `${var}` → `{{VAR}}`

### 4. Organize Folders

Create folder structure:

```vex
request {
  name: "📁 API Folder"
  type: folder
}

request {
  name: "Get Endpoint"
  type: http-request
}
```

### 5. Test & Save

1. Open in VEX
2. Test each request
3. Fix any issues
4. Save as `collection.vex`

---

## Troubleshooting

### Requests Don't Show

**Problem**: Imported collection appears empty

**Solution**:
- Check VEX format is valid
- Ensure `request { }` blocks exist
- Verify headers/params indentation

### Variables Not Working

**Problem**: `{{VAR}}` not interpolating

**Solution**:
- Use double braces: `{{VAR}}`
- Define variable in service
- Check spelling matches exactly

### Encoding Issues

**Problem**: Special characters corrupted

**Solution**:
- Save file as UTF-8
- Use JSON escape sequences
- Check file encoding in editor

### Large Files

**Problem**: Collection takes time to load

**Solution**:
- Split into multiple `.vex` files
- Use folders to organize
- Remove unused requests

---

## Best Practices

1. **Verify after import**
   - Test a few requests
   - Check headers/auth
   - Validate URLs

2. **Clean up**
   - Remove test requests
   - Organize with folders
   - Update variable names

3. **Document**
   - Add request descriptions
   - Explain authentication
   - Include examples

4. **Version control**
   - Commit `.vex` files
   - Track changes
   - Collaborate easily

---

## Import Checklist

- [ ] Export collection from source
- [ ] Create `.vex` file
- [ ] Copy `meta { }` section
- [ ] Convert each request
- [ ] Map headers correctly
- [ ] Transfer body content
- [ ] Set authentication
- [ ] Configure variables
- [ ] Test in VEX
- [ ] Commit to Git

---

## Future Import Tools

We're planning automated importers for:

- [ ] Postman JSON
- [ ] Insomnia JSON
- [ ] Bruno .bru files
- [ ] cURL commands
- [ ] OpenAPI/Swagger specs
- [ ] GraphQL SDL

Subscribe to updates for automated import tools!

---

## Support

For import issues:
1. Check format in generated `.vex` file
2. Validate with VEX validator
3. Open issue with example file
4. Community help in discussions

---

Happy migrating! 🚀
