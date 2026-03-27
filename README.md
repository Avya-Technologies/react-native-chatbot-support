# Chatbot Support Kit (React Native)

License: MIT

A customizable floating chatbot widget for React Native apps. Similar to web chat widgets, this package adds a floating chat button to your app that opens a beautiful chat interface with AI integration support.

## Features

- Drop-in Widget - Wrap any screen to add chat functionality
- Beautiful Chat UI - Modern chat interface with smooth animations
- Fully Customizable - Colors, sizes, messages, and positioning
- AI Integration - Built-in support for AI-powered responses
- WebSocket Support - Real-time communication via WebSocket
- Typing Indicator - Animated typing indicator for bot responses
- Responsive - Works on phones and tablets

## Installation

```sh
npm install react-native-chatbot-support
```

## Usage

Wrap your app content with `ChatBotWidget`:

```tsx
import React from "react";
import { View, Text } from "react-native";
import { ChatBotWidget, ChatConfig } from "react-native-chatbot-support";

const config: ChatConfig = {
  title: "Support Bot",
  themeColor: "#007BFF",
  initialMessage: "Hi! How can I help you today?",
  profilePicUrl: "https://chat.avya.lk/images/logo.webp",
  apiKey: "your-api-key",
};

export default function App() {
  return (
    <ChatBotWidget config={config}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Home Screen</Text>
      </View>
    </ChatBotWidget>
  );
}
```

## API Key Configuration

This package requires a valid API key to enable AI-powered chatbot functionality.

To obtain a customized AI integration API key for your application, please contact the development team at `https://avya.lk/`.

## Configuration Options

Property | Type | Default | Description
--- | --- | --- | ---
title | string | required | Title displayed in the chat header
themeColor | string | `#007BFF` | Primary color for the chat widget
initialMessage | string | `Hi! How can I help you?` | Bot's greeting message
inputPlaceholder | string | `Type a message...` | Placeholder text in input field
apiKey | string | `""` | API key for backend authentication
apiEndpoint | string | `wss://chatbot.avya.lk:443/ws` | Endpoint URL for API or WebSocket
profilePicUrl | string | `null` | URL for bot's profile picture
bottomOffset | number | `24` | Distance from bottom for floating button
rightOffset | number | `16` | Distance from right for floating button
buttonSize | number | `56` | Size of the floating button
windowBorderRadius | number | `16` | Border radius of the chat window

## Architecture

```
src/
├── index.tsx
└── chat/
    ├── chat_widget.tsx
    ├── chat_config.tsx
    ├── chat_message.tsx
    ├── chat_service.tsx
    └── chat_websocket_client.tsx
```

## Platform Support

Platform | Supported
--- | ---
Android | ✅
iOS | ✅

## Contributing

See `CONTRIBUTING.md`.

## License

MIT
