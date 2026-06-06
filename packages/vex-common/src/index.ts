/**
 * VEX File Format Type Definitions
 * Similar to Bruno's .bru format but adapted for .vex extension
 */

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type RequestBodyMode = 'json' | 'text' | 'xml' | 'multipartForm' | 'formUrlEncoded' | 'none';
export type ItemType = 'folder' | 'http-request' | 'graphql-request';

export interface KeyValue {
  uid: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestBody {
  mode: RequestBodyMode;
  json?: string;
  text?: string;
  xml?: string;
  multipartForm?: KeyValue[];
  formUrlEncoded?: KeyValue[];
}

export interface VexRequest {
  uid: string;
  name: string;
  method: RequestMethod;
  url: string;
  type: 'http' | 'graphql';
  headers: KeyValue[];
  params: KeyValue[];
  body?: RequestBody;
  script?: {
    req?: string;
    res?: string;
  };
  tests?: string;
  vars?: {
    req?: KeyValue[];
    res?: KeyValue[];
  };
  auth?: {
    mode: 'none' | 'basic' | 'bearer' | 'oauth2';
    basic?: {
      username: string;
      password: string;
    };
    bearer?: {
      token: string;
    };
  };
}

export interface VexItem {
  uid: string;
  name: string;
  type: ItemType;
  request?: VexRequest;
  items?: VexItem[];
  seq?: number;
}

export interface VexCollection {
  id?: string;
  uid: string;
  name: string;
  version: '1.0.0';
  description?: string;
  items: VexItem[];
  settings?: {
    preRequestScript?: string;
    postRequestScript?: string;
  };
}

export interface VexResponse {
  statusCode: number;
  statusText: string;
  headers: { [key: string]: string };
  body: string;
  responseTime: number;
  size: number;
}

export interface CollectionTreeNode extends VexItem {
  path: string;
  children?: CollectionTreeNode[];
  isExpanded?: boolean;
}

export interface WorkspaceEnvironment {
  uid: string;
  name: string;
  variables: KeyValue[];
}