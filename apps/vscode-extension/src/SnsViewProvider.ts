import { randomUUID } from 'node:crypto';
import type * as vscode from 'vscode';
import { Author } from './domain/Author';
import { Post } from './domain/Post';
import { PostBody } from './domain/PostBody';
import { PostId } from './domain/PostId';
import { InMemoryPostRepository } from './infrastructure/InMemoryPostRepository';
import type { ExtensionMessage, SerializedPost, WebviewMessage } from './protocol/messages';

export class SnsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'snsInVscode.timelineView';

  private readonly repository = new InMemoryPostRepository();
  private webviewView: vscode.WebviewView | undefined;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.webviewView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage((raw: unknown) => {
      this.handleMessage(raw as WebviewMessage);
    });

    void this.repository.findMany().then((posts) => {
      this.send({ type: 'postsLoaded', posts: posts.map(serialize), hasMore: false });
    });
  }

  private handleMessage(msg: WebviewMessage): void {
    if (msg.type === 'submitPost') {
      const text = msg.text.trim();
      if (!text) return;

      const post = new Post(
        PostId.of(randomUUID()),
        Author.of('@user'),
        PostBody.of(text),
        new Date(),
      );

      void this.repository.save(post).then(() => {
        this.send({ type: 'postAdded', post: serialize(post) });
      });
    }
  }

  private send(msg: ExtensionMessage): void {
    void this.webviewView?.webview.postMessage(msg);
  }

  private getHtml(): string {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SNS in VS Code</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      display: flex;
      flex-direction: column;
      height: 100vh;
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    #timeline { flex: 1; overflow-y: auto; }
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
    .body { line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
    #form {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px;
      border-top: 1px solid var(--vscode-panel-border);
      background: var(--vscode-sideBar-background);
    }
    #input {
      resize: none;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      padding: 6px 8px;
      font-family: inherit;
      font-size: inherit;
      line-height: 1.4;
    }
    #input:focus { outline: 1px solid var(--vscode-focusBorder); border-color: transparent; }
    #submit {
      align-self: flex-end;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      padding: 4px 14px;
      font-size: 0.85em;
      cursor: pointer;
    }
    #submit:hover { background: var(--vscode-button-hoverBackground); }
    #submit:disabled { opacity: 0.5; cursor: default; }
  </style>
</head>
<body>
  <div id="timeline"></div>
  <form id="form">
    <textarea id="input" rows="2" placeholder="いまどうしてる？（Shift+Enter で改行）"></textarea>
    <button id="submit" type="submit">投稿</button>
  </form>
  <script>
    const vscode = acquireVsCodeApi();
    const timeline = document.getElementById('timeline');
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const submit = document.getElementById('submit');

    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatTime(iso) {
      const d = new Date(iso);
      return d.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function createPostEl(post) {
      const el = document.createElement('article');
      el.className = 'post';
      el.dataset.id = post.id;
      el.innerHTML =
        '<div class="post-header">' +
          '<span class="author">' + escapeHtml(post.author) + '</span>' +
          '<span class="time">' + formatTime(post.createdAt) + '</span>' +
        '</div>' +
        '<div class="body">' + escapeHtml(post.body) + '</div>';
      return el;
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'postsLoaded') {
        msg.posts.forEach((p) => timeline.appendChild(createPostEl(p)));
      } else if (msg.type === 'postAdded') {
        timeline.prepend(createPostEl(msg.post));
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      submit.disabled = true;
      vscode.postMessage({ type: 'submitPost', text });
      input.value = '';
      submit.disabled = false;
    });
  </script>
</body>
</html>`;
  }
}

function serialize(post: Post): SerializedPost {
  return {
    id: post.id.toString(),
    author: post.author.toString(),
    body: post.body.toString(),
    createdAt: post.createdAt.toISOString(),
  };
}
