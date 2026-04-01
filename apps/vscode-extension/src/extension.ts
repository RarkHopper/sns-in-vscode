import * as fs from 'node:fs';
import * as path from 'node:path';
import { Database } from '@sns-in-vscode/db';
import * as vscode from 'vscode';
import { SqlitePostRepository } from './infrastructure/SqlitePostRepository';
import { SnsViewProvider } from './SnsViewProvider';

export const activate = (context: vscode.ExtensionContext): void => {
  const storageDir = context.globalStorageUri.fsPath;
  fs.mkdirSync(storageDir, { recursive: true });
  const dbPath = path.join(storageDir, 'sns.db');

  const db = Database.open(dbPath);
  const repository = new SqlitePostRepository(db);

  const provider = new SnsViewProvider(context.extensionUri, repository);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SnsViewProvider.viewType, provider),
  );
};
