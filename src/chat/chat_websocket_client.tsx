type OnMessage = (data: any) => void;
type OnDone = (event?: WebSocketCloseEvent) => void;
type OnError = (error: any) => void;

export class ChatWebSocketClient {
  public readonly url: string;
  public readonly chatId: string;

  private socket: WebSocket | null = null;

  public onMessage?: OnMessage;
  public onDone?: OnDone;
  public onError?: OnError;

  constructor(url: string, chatId: string) {
    this.url = url;
    this.chatId = chatId;
  }

  connect(): Promise<void> {
    const wsUrl = this.url;

    this.socket = new WebSocket(wsUrl);

    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error("Socket not created"));

      this.socket.onopen = () => resolve();

      this.socket.onmessage = (event) => {
        let data: any = event.data;
        if (typeof event.data === "string") {
          try {
            data = JSON.parse(event.data);
          } catch {
            data = event.data;
          }
        }

        this.onMessage?.(data);
      };

      this.socket.onerror = (e: any) => {
        this.onError?.(e);
        reject(e);
      };

      this.socket.onclose = (event) => {
        this.onDone?.(event);
      };
    });
  }

  sendMessage(message: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    this.socket.send(
      JSON.stringify({
        content: message,
      }),
    );
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
