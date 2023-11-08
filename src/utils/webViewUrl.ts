interface GlobalObject extends Window {
  WEBVIEW_SERVER_URL?: string;
};

/**
 * Return the current webview url if found.
 */
export function getCurrentServerUrl(): string | undefined {
  return (self as GlobalObject).WEBVIEW_SERVER_URL;
}
