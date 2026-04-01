import * as vscode from 'vscode';
import { SnsViewProvider } from './SnsViewProvider';

export const activate = (context: vscode.ExtensionContext): void => {
  const provider = new SnsViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SnsViewProvider.viewType, provider),
  );
};
