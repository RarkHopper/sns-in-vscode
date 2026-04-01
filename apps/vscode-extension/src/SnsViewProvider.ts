import { randomUUID } from 'node:crypto';
import * as vscode from 'vscode';
import { Author } from './domain/Author';
import { Post } from './domain/Post';
import { PostBody } from './domain/PostBody';
import { PostId } from './domain/PostId';
import type { PostRepository } from './domain/PostRepository';
import type {
  ExtensionMessage,
  SerializedPost,
  SerializedToken,
  WebviewMessage,
} from './protocol/messages';

const PAGE_SIZE = 20;

export class SnsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'snsInVscode.timelineView';

  private webviewView: vscode.WebviewView | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly repository: PostRepository,
  ) {}

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

    void this.repository.findMany(undefined, PAGE_SIZE).then((posts) => {
      this.send({
        type: 'postsLoaded',
        posts: posts.map(serialize),
        hasMore: posts.length === PAGE_SIZE,
      });
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
    } else if (msg.type === 'openSymbol') {
      void this.openSymbol(msg.filePath, msg.symbol);
    } else {
      void this.repository.findMany(msg.cursor, PAGE_SIZE).then((posts) => {
        this.send({
          type: 'postsLoaded',
          posts: posts.map(serialize),
          hasMore: posts.length === PAGE_SIZE,
        });
      });
    }
  }

  private async openSymbol(filePath: string, symbol: string | undefined): Promise<void> {
    const folders = vscode.workspace.workspaceFolders;
    const folder = folders?.at(0);
    if (!folder) return;
    const root = folder.uri;
    const uri = vscode.Uri.joinPath(root, filePath);
    let doc: vscode.TextDocument;
    try {
      doc = await vscode.workspace.openTextDocument(uri);
    } catch {
      void vscode.window.showWarningMessage(`ファイルが見つかりません: ${filePath}`);
      return;
    }
    const editor = await vscode.window.showTextDocument(doc, { preview: true });
    if (!symbol) return;

    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[] | undefined>(
      'vscode.executeDocumentSymbolProvider',
      uri,
    );
    const found = symbols?.find((s) => s.name === symbol);
    if (found) {
      editor.revealRange(found.range, vscode.TextEditorRevealType.InCenter);
      editor.selection = new vscode.Selection(found.range.start, found.range.start);
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
    .symbol-badge {
      display: inline;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border: none;
      border-radius: 3px;
      padding: 1px 5px;
      font-size: 0.8em;
      font-family: var(--vscode-editor-font-family);
      cursor: pointer;
      vertical-align: baseline;
    }
    .symbol-badge:hover { opacity: 0.85; }
    #sentinel {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--vscode-descriptionForeground);
      font-size: 0.75em;
    }
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
  <div id="timeline">
    <div id="sentinel"></div>
  </div>
  <form id="form">
    <textarea id="input" rows="2" placeholder="いまどうしてる？（Shift+Enter で改行）"></textarea>
    <button id="submit" type="submit">投稿</button>
  </form>
  <script>
    const vscode = acquireVsCodeApi();
    const timeline = document.getElementById('timeline');
    const sentinel = document.getElementById('sentinel');
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const submit = document.getElementById('submit');

    let hasMore = false;
    let loading = false;
    let lastCursor = null;

    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderBody(tokens) {
      return tokens.map((t) => {
        if (t.type === 'text') return '<span>' + escapeHtml(t.text) + '</span>';
        const label = t.symbol ? t.filePath + '#' + t.symbol : t.filePath;
        return '<button class="symbol-badge"' +
          ' data-file="' + escapeHtml(t.filePath) + '"' +
          (t.symbol ? ' data-symbol="' + escapeHtml(t.symbol) + '"' : '') +
          '>' + escapeHtml(label) + '</button>';
      }).join('');
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
        '<div class="body">' + renderBody(post.tokens) + '</div>';
      return el;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loading = true;
        sentinel.textContent = '読み込み中…';
        vscode.postMessage({ type: 'loadMore', cursor: lastCursor });
      }
    }, { threshold: 0.1 });
    observer.observe(sentinel);

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'postsLoaded') {
        msg.posts.forEach((p) => {
          timeline.insertBefore(createPostEl(p), sentinel);
          lastCursor = p.id;
        });
        hasMore = msg.hasMore;
        loading = false;
        sentinel.textContent = hasMore ? '' : '以上です';
        if (!hasMore) observer.unobserve(sentinel);
      } else if (msg.type === 'postAdded') {
        timeline.insertBefore(createPostEl(msg.post), timeline.firstChild);
      }
    });

    timeline.addEventListener('click', (e) => {
      const badge = e.target.closest('.symbol-badge');
      if (!badge) return;
      const msg = { type: 'openSymbol', filePath: badge.dataset.file };
      if (badge.dataset.symbol) msg.symbol = badge.dataset.symbol;
      vscode.postMessage(msg);
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
    tokens: post.body.tokens().map((t): SerializedToken => {
      if (t.type === 'text') return { type: 'text', text: t.text };
      return t.ref.symbol !== undefined
        ? { type: 'symbol', filePath: t.ref.filePath, symbol: t.ref.symbol }
        : { type: 'symbol', filePath: t.ref.filePath };
    }),
  };
}
