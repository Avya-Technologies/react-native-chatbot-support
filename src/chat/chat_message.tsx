export enum MessageSender {
  USER = "user",
  BOT = "bot",
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

export const createMessage = (
  text: string,
  sender: MessageSender,
  timestamp?: Date,
): ChatMessage => {
  return {
    id: generateMessageId(),
    text,
    sender,
    timestamp: timestamp || new Date(),
  };
};

export const isUserMessage = (message: ChatMessage): boolean => {
  return message.sender === MessageSender.USER;
};

export const isBotMessage = (message: ChatMessage): boolean => {
  return message.sender === MessageSender.BOT;
};

const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatMessageTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
