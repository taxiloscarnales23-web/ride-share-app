import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: "rider" | "driver";
  messageText?: string;
  imageUrl?: string;
  messageType: "text" | "image" | "system";
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

interface Conversation {
  id: number;
  rideId: number;
  riderId: number;
  driverId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TypingUser {
  userId: number;
  isTyping: boolean;
}

/**
 * Chat Screen - In-app messaging for riders and drivers
 * Displays conversation history, message input, and real-time updates
 */
export default function ChatScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock data for demonstration
  const mockMessages: Message[] = [
    {
      id: 1,
      conversationId: 1,
      senderId: 1,
      senderType: "driver",
      messageText: "Hi! I'm on my way to your location",
      messageType: "text",
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 60000),
    },
    {
      id: 2,
      conversationId: 1,
      senderId: 2,
      senderType: "rider",
      messageText: "Great! I'm ready. What's your ETA?",
      messageType: "text",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 60000),
    },
    {
      id: 3,
      conversationId: 1,
      senderId: 1,
      senderType: "driver",
      messageText: "About 5 minutes away",
      messageType: "text",
      isRead: true,
      createdAt: new Date(Date.now() - 1 * 60000),
    },
  ];

  useEffect(() => {
    // Load initial messages
    setMessages(mockMessages);
    setConversation({
      id: 1,
      rideId: 1,
      riderId: 2,
      driverId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setLoading(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversation) return;

    setSending(true);
    try {
      // Create new message
      const newMessage: Message = {
        id: messages.length + 1,
        conversationId: conversation.id,
        senderId: 2, // Current user (rider)
        senderType: "rider",
        messageText: messageText.trim(),
        messageType: "text",
        isRead: false,
        createdAt: new Date(),
      };

      setMessages([...messages, newMessage]);
      setMessageText("");

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Simulate read receipt after 1 second
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, isRead: true } : msg
          )
        );
      }, 1000);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);
    // Simulate typing indicator
    if (text.length > 0) {
      setTypingUsers([{ userId: 2, isTyping: true }]);
    } else {
      setTypingUsers([]);
    }
  };

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.senderType === "rider";
    const messageContainerClass = isCurrentUser ? "self-end" : "self-start";
    const messageBgColor = isCurrentUser ? colors.primary : colors.surface;
    const messageTextColor = isCurrentUser ? colors.background : colors.foreground;

    return (
      <View
        key={message.id}
        className={cn("mb-3 flex-row", isCurrentUser ? "justify-end" : "justify-start")}
      >
        <View
          className={cn(
            "max-w-xs rounded-2xl px-4 py-2",
            isCurrentUser ? "rounded-br-none" : "rounded-bl-none"
          )}
          style={{ backgroundColor: messageBgColor }}
        >
          {message.messageType === "text" && (
            <Text style={{ color: messageTextColor }} className="text-base">
              {message.messageText}
            </Text>
          )}
          {message.messageType === "image" && message.imageUrl && (
            <Image
              source={{ uri: message.imageUrl }}
              className="w-48 h-48 rounded-lg"
            />
          )}
          <View className="flex-row items-center justify-end mt-1 gap-1">
            <Text style={{ color: messageTextColor }} className="text-xs opacity-70">
              {message.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {isCurrentUser && message.isRead && (
              <Text style={{ color: messageTextColor }} className="text-xs">
                ✓✓
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={100}
    >
      <ScreenContainer className="justify-between">
        {/* Header */}
        <View className="pb-3 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-lg font-bold text-foreground">Driver Chat</Text>
          <Text className="text-sm text-muted">Ride #1234</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View className="items-center justify-center flex-1 py-8">
              <Text className="text-muted text-center">
                No messages yet. Start a conversation!
              </Text>
            </View>
          ) : (
            messages.map((msg) => renderMessage(msg))
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <View className="mb-3 flex-row items-center gap-2">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xs">🚗</Text>
              </View>
              <View className="flex-row gap-1">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.muted }}
                />
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.muted }}
                />
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.muted }}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 py-3 border-t gap-3" style={{ borderTopColor: colors.border }}>
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 px-4 py-2 rounded-full border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.foreground,
              }}
              placeholder="Type a message..."
              placeholderTextColor={colors.muted}
              value={messageText}
              onChangeText={handleTyping}
              editable={!sending}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sending}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: messageText.trim() ? colors.primary : colors.surface,
                opacity: messageText.trim() ? 1 : 0.5,
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text className="text-lg">➤</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 py-2 rounded-lg items-center border"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-sm text-primary">📍 Share Location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-2 rounded-lg items-center border"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-sm text-primary">🖼️ Share Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
