import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { ChatService } from "./chat_service";
import { BASE_URL } from "./base_url";

type Sender = "user" | "bot";

type ChatMessage = {
  id: string;
  text: string;
  sender: Sender;
};

type ChatConfig = {
  title?: string;
  themeColor?: string;
  initialMessage?: string;
  inputPlaceholder?: string;

  bottomOffset?: number;
  rightOffset?: number;
  buttonSize?: number;
  windowBorderRadius?: number;

  profilePicUrl?: string | null;
  onSendMessage?: (text: string) => Promise<string>;
  apiKey?: string;
  apiEndpoint?: string;
};

const defaultConfig: Required<
  Omit<ChatConfig, "onSendMessage" | "profilePicUrl">
> & { profilePicUrl: string | null } = {
  title: "",
  themeColor: "#1976D2",
  initialMessage: "Hi! How can I help you?",
  inputPlaceholder: "Type a message...",
  bottomOffset: 24,
  rightOffset: 16,
  buttonSize: 56,
  windowBorderRadius: 16,
  apiKey: "",
  apiEndpoint: BASE_URL,
  profilePicUrl: null,
};

function mixHexColor(baseHex: string, mixHex: string, amount: number) {
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "").trim();
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };
  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

  const a = hexToRgb(baseHex);
  const b = hexToRgb(mixHex);

  const r = Math.round(a.r + (b.r - a.r) * amount);
  const g = Math.round(a.g + (b.g - a.g) * amount);
  const bb = Math.round(a.b + (b.b - a.b) * amount);

  return rgbToHex(r, g, bb);
}

function TypingDots() {
  const a1 = useRef(new Animated.Value(0.3)).current;
  const a2 = useRef(new Animated.Value(0.3)).current;
  const a3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.3,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.delay(150),
        ]),
      );

    const l1 = loop(a1, 0);
    const l2 = loop(a2, 120);
    const l3 = loop(a3, 240);

    l1.start();
    l2.start();
    l3.start();

    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, [a1, a2, a3]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Animated.View style={[styles.dot, { opacity: a1 }]} />
      <View style={{ width: 6 }} />
      <Animated.View style={[styles.dot, { opacity: a2 }]} />
      <View style={{ width: 6 }} />
      <Animated.View style={[styles.dot, { opacity: a3 }]} />
    </View>
  );
}

export function ChatBotWidget(props: {
  children: React.ReactNode;
  config: ChatConfig;
}) {
  const merged = { ...defaultConfig, ...props.config };
  const config: ChatConfig = merged;

  const { width: screenW, height: screenH } = useWindowDimensions();

  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("");
  const textRef = useRef("");
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const serviceRef = useRef<ChatService | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: String(Date.now()),
      text: config.initialMessage ?? defaultConfig.initialMessage,
      sender: "bot",
    },
  ]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const headerColor = useMemo(
    () => mixHexColor(config.themeColor!, "#000000", 0.3),
    [config.themeColor],
  );
  const bodyColor = useMemo(
    () => mixHexColor(config.themeColor!, "#FFFFFF", 0.88),
    [config.themeColor],
  );
  const userMsgColor = useMemo(
    () => mixHexColor(config.themeColor!, "#000000", 0.3),
    [config.themeColor],
  );
  const botMsgColor = useMemo(
    () => mixHexColor(config.themeColor!, "#000000", 0.1),
    [config.themeColor],
  );
  const footerColor = useMemo(
    () => mixHexColor(config.themeColor!, "#FFFFFF", 0.9),
    [config.themeColor],
  );

  const isTabletLike = Math.min(screenW, screenH) >= 600;
  const windowWidth = isTabletLike ? screenW * 0.6 : screenW * 0.9;
  const windowHeight = isTabletLike ? screenH * 0.55 : screenH * 0.6;

  const openChat = () => {
    setIsOpen(true);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  };

  const closeChat = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setIsOpen(false);
    });
  };

  const toggleChat = () => {
    if (isOpen) closeChat();
    else openChat();
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()) + "-u",
      text: trimmed,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setText("");
    textRef.current = "";
    inputRef.current?.clear();
    setIsTyping(true);
    scrollToBottom();

    try {
      const handler =
        config.onSendMessage ??
        (async (t: string) => {
          if (!serviceRef.current)
            serviceRef.current = new ChatService(config as any);
          return serviceRef.current.sendMessage(t);
        });

      const response = await handler(trimmed);
      const botMsg: ChatMessage = {
        id: String(Date.now()) + "-b",
        text: response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()) + "-e",
          text: "Something went wrong.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const bubbleMaxW = windowWidth * 0.75;

  return (
    <View style={{ flex: 1 }}>
      {props.children}

      {isOpen && (
        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={StyleSheet.absoluteFill}
        >
          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <View
              pointerEvents="box-none"
              style={[
                styles.windowAnchor,
                {
                  bottom:
                    (config.bottomOffset ?? 24) +
                    (config.buttonSize ?? 56) +
                    24,
                  right: config.rightOffset ?? 16,
                  left: 12,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.window,
                  {
                    width: windowWidth,
                    height: windowHeight,
                    borderRadius: config.windowBorderRadius ?? 16,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.header,
                    {
                      backgroundColor: headerColor,
                      borderTopLeftRadius: config.windowBorderRadius ?? 16,
                      borderTopRightRadius: config.windowBorderRadius ?? 16,
                    },
                  ]}
                >
                  <View style={styles.avatarWrap}>
                    {config.profilePicUrl ? (
                      <Image
                        source={{ uri: config.profilePicUrl }}
                        style={styles.avatarImg}
                      />
                    ) : (
                      <Text style={styles.avatarIcon}>🤖</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{config.title}</Text>
                    <Text style={styles.headerSub}>
                      {isTyping ? "typing..." : "online"}
                    </Text>
                  </View>

                  <Pressable onPress={closeChat} hitSlop={10}>
                    <Text style={styles.close}>✕</Text>
                  </Pressable>
                </View>

                <View style={[styles.body, { backgroundColor: bodyColor }]}>
                  <FlatList<ChatMessage>
                    ref={listRef}
                    data={
                      isTyping
                        ? [
                            ...messages,
                            { id: "typing", text: "", sender: "bot" as Sender },
                          ]
                        : messages
                    }
                    keyExtractor={(m) => m.id}
                    removeClippedSubviews={false}
                    contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
                    renderItem={({ item }) => {
                      if (item.id === "typing") {
                        return (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-start",
                              marginBottom: 10,
                            }}
                          >
                            <View
                              style={[
                                styles.typingWrap,
                                { backgroundColor: botMsgColor },
                              ]}
                            >
                              <TypingDots />
                            </View>
                          </View>
                        );
                      }

                      const isUser = item.sender === "user";
                      const bg = isUser ? userMsgColor : botMsgColor;

                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: isUser ? "flex-end" : "flex-start",
                            marginBottom: 10,
                          }}
                        >
                          <View
                            style={[
                              styles.bubble,
                              {
                                backgroundColor: bg,
                                maxWidth: bubbleMaxW,
                              },
                            ]}
                          >
                            <Text style={styles.bubbleText}>{item.text}</Text>
                          </View>
                        </View>
                      );
                    }}
                    onContentSizeChange={scrollToBottom}
                  />
                </View>

                <View
                  style={[
                    styles.footer,
                    {
                      backgroundColor: footerColor,
                      borderBottomLeftRadius: config.windowBorderRadius ?? 16,
                      borderBottomRightRadius: config.windowBorderRadius ?? 16,
                    },
                  ]}
                >
                  <View style={styles.inputWrap}>
                    <TextInput
                      ref={inputRef}
                      value={text}
                      onChangeText={(v) => {
                        textRef.current = v;
                        setText(v);
                      }}
                      placeholder={config.inputPlaceholder}
                      placeholderTextColor="#666"
                      style={styles.input}
                      multiline
                      returnKeyType="send"
                      onSubmitEditing={sendMessage}
                      blurOnSubmit={false}
                    />
                  </View>

                  <Pressable
                    onPress={sendMessage}
                    style={[
                      styles.sendBtn,
                      { backgroundColor: config.themeColor ?? "#1976D2" },
                    ]}
                  >
                    <Text style={styles.sendIcon}>➤</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      <View
        pointerEvents="box-none"
        style={[
          styles.fabWrap,
          {
            bottom: config.bottomOffset ?? 24,
            right: config.rightOffset ?? 16,
          },
        ]}
      >
        <Pressable
          onPress={toggleChat}
          style={[
            styles.fab,
            {
              width: config.buttonSize ?? 56,
              height: config.buttonSize ?? 56,
              backgroundColor: config.themeColor ?? "#1976D2",
            },
          ]}
        >
          <Text style={styles.fabIcon}>{isOpen ? "✕" : "💬"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: "absolute",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  fab: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabIcon: { color: "#fff", fontSize: 22 },

  windowAnchor: {
    position: "absolute",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  window: {
    overflow: "hidden",
    elevation: 8,
    backgroundColor: "#fff",
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 40, height: 40 },
  avatarIcon: { color: "#fff", fontSize: 18 },
  headerTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  headerSub: { color: "rgba(255,255,255,0.8)", marginTop: 2, fontSize: 13 },
  close: { color: "#fff", fontSize: 22, paddingHorizontal: 6 },

  body: { flex: 1 },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  bubbleText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },

  typingWrap: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  footer: {
    padding: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  inputWrap: { flex: 1, maxHeight: 110 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#111",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: { color: "#fff", fontSize: 18 },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
});
