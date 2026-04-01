/**
 * Extension → Webview へ送るメッセージ
 */
export type ExtensionMessage = PostsLoadedMessage | PostAddedMessage;

/** 初回ロードまたは追加ページのデータ */
export interface PostsLoadedMessage {
  type: 'postsLoaded';
  posts: SerializedPost[];
  hasMore: boolean;
}

/** 新規投稿が追加されたとき（フォーム投稿後など） */
export interface PostAddedMessage {
  type: 'postAdded';
  post: SerializedPost;
}

/** シンボルバッジをクリックしてファイル/シンボルを開く */
export interface OpenSymbolMessage {
  type: 'openSymbol';
  filePath: string;
  symbol?: string;
}

/**
 * Webview → Extension へ送るメッセージ
 */
export type WebviewMessage = LoadMoreMessage | SubmitPostMessage | OpenSymbolMessage;

/** 次ページをリクエスト */
export interface LoadMoreMessage {
  type: 'loadMore';
  cursor: string;
}

/** ユーザーが投稿フォームから送信 */
export interface SubmitPostMessage {
  type: 'submitPost';
  text: string;
}

/**
 * Post のトークン（JSON シリアライズ形式）
 */
export type SerializedToken =
  | { type: 'text'; text: string }
  | { type: 'symbol'; filePath: string; symbol?: string };

/**
 * Post の JSON シリアライズ表現（Date → ISO文字列）
 */
export interface SerializedPost {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  tokens: SerializedToken[];
}
