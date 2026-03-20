import { Text, View, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { ChatBotWidget} from "react-native-chatbot";

const chatConfig = {
  title: "Support Bot",
  themeColor: "#007BFF",
  initialMessage: "Hi! How can I help you today?",
  profilePicUrl: "https://i.pravatar.cc/40",
  apiKey:
    "sk-avya-b61db99e-465c-4996-99d5-85e2c77c475b-cb-ad081b96-7997-4a8b-bd24-a28b4cdf9cbc",
};

function HomePage() {
  return (
    <View style={styles.body}>
      <Text style={styles.icon}>💬</Text>
      <View style={styles.spacer24} />
      <Text style={styles.headline}>React-native ChatBot Demo</Text>
      <View style={styles.spacer12} />
      <Text style={styles.bodyText}>
        Tap the chat button in the bottom right corner
      </Text>
      <View style={styles.spacer8} />
      <Text style={styles.bodyText}>to start a conversation! 💬</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>My App</Text>
      </View>
      <ChatBotWidget config={chatConfig}>
        <HomePage />
      </ChatBotWidget>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  appBar: {
    backgroundColor: "#E8DEF8",
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1C1B1F",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 80,
    color: "#9CA3AF",
  },
  headline: {
    fontSize: 24,
    fontWeight: "500",
    color: "#1C1B1F",
  },
  bodyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  spacer24: {
    height: 24,
  },
  spacer12: {
    height: 12,
  },
  spacer8: {
    height: 8,
  },
});
