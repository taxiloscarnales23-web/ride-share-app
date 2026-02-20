import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  isQuickReply?: boolean;
}

interface CannedReply {
  id: string;
  title: string;
  content: string;
}

export default function SupportChatScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I help you today?",
      sender: "agent",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: "2",
      text: "I have an issue with my last ride payment",
      sender: "user",
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [showCannedReplies, setShowCannedReplies] = useState(false);

  const cannedReplies: CannedReply[] = [
    {
      id: "1",
      title: "Payment Failed",
      content:
        "I understand you're having payment issues. Please try the following:\n1. Check your payment method is valid\n2. Ensure sufficient balance\n3. Try again in a few moments",
    },
    {
      id: "2",
      title: "Cancellation Policy",
      content:
        "Our cancellation policy:\n- Free cancellation within 5 minutes\n- $2.50 fee after 5 minutes\n- Full refund if driver cancels",
    },
    {
      id: "3",
      title: "Driver Behavior",
      content:
        "I'm sorry to hear about your experience. We take driver conduct seriously. Please provide ride details and incident description.",
    },
  ];

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        text: inputText,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText("");

      // Simulate agent response
      setTimeout(() => {
        const agentResponse: Message = {
          id: `msg-${Date.now()}-agent`,
          text: "Thank you for your message. Let me help you with that.",
          sender: "agent",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentResponse]);
      }, 1000);
    }
  };

  const handleCannedReply = (reply: CannedReply) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text: reply.content,
      sender: "agent",
      timestamp: new Date(),
      isQuickReply: true,
    };
    setMessages([...messages, newMessage]);
    setShowCannedReplies(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`mb-3 flex-row ${item.sender === "user" ? "justify-end" : "justify-start"}`}
    >
      <View
        className={`rounded-lg px-4 py-3 max-w-xs ${
          item.sender === "user"
            ? "rounded-br-none"
            : "rounded-bl-none"
        }`}
        style={{
          backgroundColor:
            item.sender === "user" ? colors.primary : colors.surface,
        }}
      >
        <Text
          className={`text-base leading-relaxed ${
            item.sender === "user"
              ? "text-background"
              : "text-foreground"
          }`}
        >
          {item.text}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            item.sender === "user"
              ? "text-background opacity-70"
              : "text-muted"
          }`}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  const renderCannedReply = ({ item }: { item: CannedReply }) => (
    <Pressable
      onPress={() => handleCannedReply(item)}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          marginBottom: 12,
        },
      ]}
    >
      <View
        className="rounded-lg p-3 border border-border"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-sm font-semibold text-foreground">{item.title}</Text>
        <Text className="text-xs text-muted mt-1 leading-relaxed">
          {item.content.substring(0, 60)}...
        </Text>
      </View>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScreenContainer className="p-0">
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="px-6 pt-4 pb-2 border-b border-border">
            <Text className="text-2xl font-bold text-foreground">Support</Text>
            <Text className="text-sm text-muted">Ticket #1234 • Payment Issue</Text>
          </View>

          {/* Messages */}
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            scrollEnabled={true}
          />

          {/* Canned Replies Section */}
          {showCannedReplies && (
            <View className="px-6 pb-4 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-muted uppercase">
                  Quick Replies
                </Text>
                <Pressable onPress={() => setShowCannedReplies(false)}>
                  <Text className="text-xs text-primary">Hide</Text>
                </Pressable>
              </View>
              <FlatList
                data={cannedReplies}
                renderItem={renderCannedReply}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Input Area */}
          <View
            className="px-6 pb-4 gap-3 border-t border-border"
            style={{ backgroundColor: colors.background }}
          >
            {/* Quick Actions */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowCannedReplies(!showCannedReplies)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                  },
                ]}
              >
                <Text className="text-sm font-semibold text-primary">
                  💬 Quick Replies
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                  },
                ]}
              >
                <Text className="text-sm font-semibold text-primary">
                  📎 Attach
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.error,
                    alignItems: "center",
                  },
                ]}
              >
                <Text className="text-sm font-semibold text-error">
                  🚨 Escalate
                </Text>
              </Pressable>
            </View>

            {/* Message Input */}
            <View className="flex-row gap-2 items-flex-end">
              <TextInput
                placeholder="Type your message..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor={colors.muted}
                multiline
                maxLength={500}
                className="flex-1 rounded-lg px-4 py-3 border border-border text-foreground"
                style={{
                  backgroundColor: colors.surface,
                  maxHeight: 100,
                }}
              />
              <Pressable
                onPress={handleSendMessage}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: colors.primary,
                  },
                  {
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <Text className="text-xl">📤</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
