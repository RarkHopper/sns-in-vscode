import type * as vscode from 'vscode';
import type { Post } from './domain/Post';
import { InMemoryPostRepository } from './infrastructure/InMemoryPostRepository';

export class SnsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'snsInVscode.timelineView';

  private readonly repository = new InMemoryPostRepository();

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    void this.repository.findMany().then((posts) => {
      webviewView.webview.html = this.getHtml(posts);
    });
  }

  private getHtml(posts: Post[]): string {
    const postsHtml = posts
      .map(
        (post) => `
      <article class="post">
        <div class="post-header">
          <span class="author">${escapeHtml(post.author.toString())}</span>
          <span class="time">${formatTime(post.createdAt)}</span>
        </div>
        <div class="body">${escapeHtml(post.body.toString())}</div>
      </article>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SNS in VS Code</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    .timeline { display: flex; flex-direction: column; }
    .post {
      padding: 12px 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .post:hover { background: var(--vscode-list-hoverBackground); }
    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .author {
      font-weight: 600;
      color: var(--vscode-textLink-foreground);
      font-size: 0.85em;
    }
    .time {
      color: var(--vscode-descriptionForeground);
      font-size: 0.75em;
    }
    .body {
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="timeline">${postsHtml}</div>
</body>
</html>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTime(date: Date): string {
  return date.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
