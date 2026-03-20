import type { CSSProperties } from "react";
import { BASE_URL } from "./base_url";
export interface ChatConfig {
  title: string;
  profilePicUrl?: string;
  themeColor?: string;
  initialMessage?: string;
  inputPlaceholder?: string;
  apiKey?: string;
  apiEndpoint?: string;
  bottomOffset?: number;
  rightOffset?: number;
  buttonSize?: number;
  windowBorderRadius?: number;
  windowWidth?: number;
  windowHeight?: number;
}

export const DEFAULT_CHAT_CONFIG: Required<ChatConfig> = {
  title: "Chat Support",
  profilePicUrl: "",
  themeColor: "#007BFF",
  initialMessage: "Hi! How can I help you?",
  inputPlaceholder: "Type a message",
  apiKey: "",
  apiEndpoint: BASE_URL,
  bottomOffset: 20,
  rightOffset: 20,
  buttonSize: 56,
  windowBorderRadius: 12,
  windowWidth: 350,
  windowHeight: 500,
};

export const mergeConfig = (config: ChatConfig): Required<ChatConfig> => {
  return {
    ...DEFAULT_CHAT_CONFIG,
    ...config,
  };
};

export const getStylesFromConfig = (
  config: Required<ChatConfig>,
): CSSProperties => {
  return {
    "--chat-theme-color": config.themeColor,
    "--chat-button-size": `${config.buttonSize}px`,
    "--chat-bottom-offset": `${config.bottomOffset}px`,
    "--chat-right-offset": `${config.rightOffset}px`,
    "--chat-window-width": `${config.windowWidth}px`,
    "--chat-window-height": `${config.windowHeight}px`,
    "--chat-border-radius": `${config.windowBorderRadius}px`,
  } as CSSProperties;
};
