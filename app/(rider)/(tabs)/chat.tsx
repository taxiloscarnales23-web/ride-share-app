import { ScrollView, Text, View, TextInput, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface Message {
  id: number;
  text: string;
  sender: "rider" | "driver";
  timestamp: Date;
}

export default function ChatScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm on my way to pick you up",
      sender: "driver",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: 2,
      text: "Great! I'm waiting outside",
      sender: "rider",
      timestamp: new Date(Date.now() - 3 * 60000),
    },
    {
      id: 3,
      text: "I'm about 2 minutes away",
      sender: "driver",
      timestamp: new Date(Date.now() - 1 * 60000),
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: "rider",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate driver response
    setTimeout(() => {
      const driverResponse: Message = {
        id: messages.length + 2,
        text: "Thanks for letting me know!",
        sender: "driver",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, driverResponse]);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ScreenContainer className="p-0 flex-col">
      {/* Header */}
      <View className="bg-surface border-b border-border p-4">
        <Text className="text-lg font-bold text-foreground">Driver Support</Text>
        <Text className="text-xs text-muted">John Smith • 🟢 Online</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View
            className={`flex-row ${item.sender === "rider" ? "justify-end" : "justify-start"}`}
          >
            <View
              className={`max-w-xs rounded-2xl px-4 py-2 ${
                item.sender === "rider"
                  ? "bg-primary rounded-br-none"
                  : "bg-surface border border-border rounded-bl-none"
              }`}
            >
              <Text
                className={`text-sm ${
                  item.sender === "rider" ? "text-white" : "text-foreground"
                }`}
              >
                {item.text}
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  item.sender === "rider" ? "text-white/70" : "text-muted"
                }`}
              >
                {formatTime(item.timestamp)}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Input */}
      <View className="border-t border-border bg-surface p-4 flex-row gap-2 items-end">
        <TextInput
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          className="flex-1 bg-background border border-border rounded-full px-4 py-3 text-foreground"
          placeholderTextColor={colors.muted}
        />
        <Pressable
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.9 : 1 }],
              opacity: !inputText.trim() ? 0.5 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-lg">📤</Text>
          </View>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
