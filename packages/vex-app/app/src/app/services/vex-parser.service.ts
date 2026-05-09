import { Injectable } from '@angular/core';
import { VexCollection, VexItem, VexRequest, KeyValue, RequestBody, RequestBodyMode } from '../models/vex-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parser service for .vex file format
 * Converts between VEX objects and plain text format
 */
@Injectable({
  providedIn: 'root'
})
export class VexParserService {

  parseVexFile(content: string): VexCollection {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    const collection: VexCollection = {
      uid: uuidv4(),
      name: 'New Collection',
      version: '1.0.0',
      items: []
    };

    let currentSection = '';
    let currentItem: any = {};

    for (const line of lines) {
      if (line.startsWith('meta {')) {
        currentSection = 'meta';
        continue;
      }
      if (line.startsWith('request {')) {
        currentSection = 'request';
        currentItem = { headers: [], params: [], type: 'http' };
        continue;
      }

      if (line === '}') {
        if (currentSection === 'meta') {
          // Meta section closed
        } else if (currentSection === 'request') {
          if (currentItem.url && currentItem.method) {
            collection.items.push({
              uid: uuidv4(),
              name: currentItem.name || 'New Request',
              type: 'http-request',
              request: currentItem
            });
          }
          currentItem = {};
          currentSection = '';
        }
        continue;
      }

      // Parse key-value pairs
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (currentSection === 'meta') {
        if (key === 'name') collection.name = value.replace(/['"]/g, '');
        if (key === 'desc') collection.description = value.replace(/['"]/g, '');
      } else if (currentSection === 'request') {
        if (key === 'method') currentItem.method = value.toUpperCase();
        if (key === 'url') currentItem.url = value;
        if (key === 'name') currentItem.name = value.replace(/['"]/g, '');
        if (key === 'type') currentItem.type = value;
        if (line.startsWith('headers')) {
          currentItem.headers = this.parseKeyValueLines(lines);
        }
        if (line.startsWith('params')) {
          currentItem.params = this.parseKeyValueLines(lines);
        }
        if (line.startsWith('body')) {
          currentItem.body = this.parseBody(value);
        }
      }
    }

    return collection;
  }

  serializeToVexFormat(collection: VexCollection): string {
    let content = `meta {
  name: "${collection.name}"
  desc: "${collection.description || ''}"
}

`;

    collection.items.forEach((item, index) => {
      if (item.type === 'http-request' && item.request) {
        content += this.serializeRequest(item.request);
        if (index < collection.items.length - 1) {
          content += '\n---\n\n';
        }
      }
    });

    return content;
  }

  private serializeRequest(request: VexRequest): string {
    let content = `request {
  name: "${request.name}"
  method: ${request.method}
  url: ${request.url}
  type: ${request.type}
`;

    if (request.headers && request.headers.length > 0) {
      content += '\n  headers {\n';
      request.headers.forEach(h => {
        const status = h.enabled ? '' : '// ';
        content += `    ${status}${h.key}: ${h.value}\n`;
      });
      content += '  }\n';
    }

    if (request.params && request.params.length > 0) {
      content += '\n  params {\n';
      request.params.forEach(p => {
        const status = p.enabled ? '' : '// ';
        content += `    ${status}${p.key}: ${p.value}\n`;
      });
      content += '  }\n';
    }

    if (request.body && request.body.mode !== 'none') {
      content += `\n  body: ${request.body.mode}`;
      if (request.body.json) {
        content += ` ${request.body.json}`;
      } else if (request.body.text) {
        content += ` ${request.body.text}`;
      }
      content += '\n';
    }

    if (request.auth && request.auth.mode !== 'none') {
      content += `\n  auth: ${request.auth.mode}`;
      if (request.auth.bearer) {
        content += ` ${request.auth.bearer.token}`;
      }
      content += '\n';
    }

    content += '}';
    return content;
  }

  private parseKeyValueLines(lines: string[]): KeyValue[] {
    const kvPairs: KeyValue[] = [];
    // Implementation would parse key-value pairs from indented lines
    return kvPairs;
  }

  private parseBody(value: string): RequestBody {
    const mode = value.split(/\s+/)[0] as RequestBodyMode;
    return {
      mode: mode || 'none',
      text: value
    };
  }

  // Utility: Create new request
  createNewRequest(name: string = 'New Request'): VexRequest {
    return {
      uid: uuidv4(),
      name,
      method: 'GET',
      url: 'https://api.example.com',
      type: 'http',
      headers: [],
      params: [],
      body: { mode: 'none' },
      auth: { mode: 'none' }
    };
  }

  // Utility: Create new collection
  createNewCollection(name: string = 'New Collection'): VexCollection {
    return {
      uid: uuidv4(),
      name,
      version: '1.0.0',
      items: []
    };
  }

  // Utility: Create new item (folder)
  createNewFolder(name: string = 'New Folder'): VexItem {
    return {
      uid: uuidv4(),
      name,
      type: 'folder',
      items: []
    };
  }
}
