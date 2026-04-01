import * as vscode from 'vscode';
import { buildHelloMessage, extensionCommand } from './hello';

export const activate = (context: vscode.ExtensionContext): void => {
  const helloCommand = vscode.commands.registerCommand(extensionCommand, () => {
    return vscode.window.showInformationMessage(buildHelloMessage());
  });

  context.subscriptions.push(helloCommand);
};
