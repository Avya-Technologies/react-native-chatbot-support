import type { ChatConfig } from "./chat_config";
import { ChatWebSocketClient } from "./chat_websocket_client";
import uuid from "react-native-uuid";
export class ChatService {
  private config: ChatConfig;

  constructor(config: ChatConfig) {
    this.config = config;
  }

  private async sendViaWebSocket(message: string): Promise<string> {
    const chatId = this.generateChatId();
    const base = this.config.apiEndpoint?.trim() || "";
    const wsUrl = `${base}/${this.config.apiKey}/${chatId}`;

    const client = new ChatWebSocketClient(wsUrl, chatId);

    return new Promise((resolve, reject) => {
      let buffer = "";
      const timeoutId = setTimeout(() => {
        client.disconnect();
        reject(new Error("WebSocket timeout."));
      }, 40000);

      client.onMessage = (data: any) => {
        if (data && typeof data === "object") {
          if (data.type === "start") {
            buffer = "";
            return;
          }

          if (data.type === "chunk") {
            buffer += String(data.chunk ?? "");
            return;
          }

          if (data.type === "done") {
            clearTimeout(timeoutId);
            client.disconnect();
            resolve(
              data.msg != null && String(data.msg).length > 0
                ? String(data.msg)
                : buffer,
            );
            return;
          }

          if (data.type === "error") {
            clearTimeout(timeoutId);
            client.disconnect();
            reject(new Error("WebSocket error."));
            return;
          }

          if (data.success && data.msg != null) {
            clearTimeout(timeoutId);
            client.disconnect();
            resolve(String(data.msg));
            return;
          }

          if ("response" in data && data.response != null) {
            clearTimeout(timeoutId);
            client.disconnect();
            resolve(String(data.response));
            return;
          }
        }
      };

      client.onError = (err: string) => {
        clearTimeout(timeoutId);
        client.disconnect();
        reject(new Error(`WebSocket error: ${err}`));
      };

      client.connect()
        .then(() => {
          client.sendMessage(message);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          client.disconnect();
          reject(err);
        });
    });
  }

  private generateChatId(): string {
    return uuid.v4() as string;
  }

  async sendMessage(message: string): Promise<string> {
    const apiEndpoint = this.config.apiEndpoint?.trim();
    if (!apiEndpoint) {
      return "Please configure an API endpoint to enable AI responses.";
    }

    if (apiEndpoint.startsWith("ws://") || apiEndpoint.startsWith("wss://")) {
      try {
        return await this.sendViaWebSocket(message);
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "WebSocket error occurred.";
      }
    }

    if (!this.config.apiKey || this.config.apiKey.trim() === "") {
      return "Please configure an API key to enable AI responses.";
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "react-native-chatbot-widget",
          "X-Title": "Chat Widget",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data?.choices?.[0]?.message?.content || "No response received.";
      } else {
        return `Error: Failed to get response (${response.status})`;
      }
    } catch (error) {
      return "Something went wrong. Please try again.";
    }
  }

  disconnect(): void {}

  isConnected(): boolean {
    return false;
  }
}
