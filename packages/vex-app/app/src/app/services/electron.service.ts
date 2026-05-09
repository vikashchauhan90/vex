import { Injectable } from '@angular/core';

/**
 * Electron bridge service for IPC communication with main process
 * Handles file operations and other electron-specific features
 */
@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private ipc: any;

  constructor() {
    if (this.isElectron()) {
      this.ipc = (window as any).electron.ipc;
    }
  }

  private isElectron(): boolean {
    return !!(window as any).electron;
  }

  /**
   * File operations
   */
  async readFile(filePath: string): Promise<string> {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return this.ipc.invoke('read-file', filePath);
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return this.ipc.invoke('write-file', filePath, content);
  }

  async readDirectory(dirPath: string): Promise<string[]> {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return this.ipc.invoke('read-directory', dirPath);
  }

  async createDirectory(dirPath: string): Promise<void> {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return this.ipc.invoke('create-directory', dirPath);
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return this.ipc.invoke('delete-file', filePath);
  }

  async fileExists(filePath: string): Promise<boolean> {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return this.ipc.invoke('file-exists', filePath);
  }

  /**
   * Dialog operations
   */
  async selectDirectory(): Promise<string | null> {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return this.ipc.invoke('select-directory');
  }

  async selectFile(filters?: any[]): Promise<string | null> {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return this.ipc.invoke('select-file', filters);
  }

  /**
   * App operations
   */
  getAppPath(): string {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return (window as any).electron.app.getAppPath();
  }

  getUserDataPath(): string {
    if (!this.isElectron()) {
      throw new Error('Electron not available');
    }
    return (window as any).electron.app.getUserDataPath();
  }
}
