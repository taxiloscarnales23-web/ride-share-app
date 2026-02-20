import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface PinnedMessage {
  id: number;
  messageId: number;
  conversationId: number;
  messageText?: string;
  senderName: string;
  pinnedAt: Date;
  isPinned: boolean;
}

interface PinnedMessagesScreenProps {
  conversationId?: number;
  onMessageSelect?: (messageId: number) => void;
}

/**
 * Pinned Messages Screen - Display and manage pinned messages in conversations
 * Shows important messages pinned to the top for easy reference
 */
export default function PinnedMessagesScreen({
  conversationId = 1,
  onMessageSelect,
}: PinnedMessagesScreenProps) {
  const colors = useColors();
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<PinnedMessage | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for demonstration
  const mockPinnedMessages: PinnedMessage[] = [
    {
      id: 1,
      messageId: 5,
      conversationId: 1,
      messageText: "Pickup location: 123 Main St, Downtown",
      senderName: "Driver",
      pinnedAt: new Date(Date.now() - 10 * 60000),
      isPinned: true,
    },
    {
      id: 2,
      messageId: 8,
      conversationId: 1,
      messageText: "I'm running 5 minutes late due to traffic",
      senderName: "Driver",
      pinnedAt: new Date(Date.now() - 5 * 60000),
      isPinned: true,
    },
    {
      id: 3,
      messageId: 12,
      conversationId: 1,
      messageText: "Please wait at the main entrance",
      senderName: "Driver",
      pinnedAt: new Date(Date.now() - 2 * 60000),
      isPinned: true,
    },
  ];

  useEffect(() => {
    // Load pinned messages
    setPinnedMessages(mockPinnedMessages);
    setLoading(false);
  }, [conversationId]);

  const handleUnpin = (messageId: number) => {
    setPinnedMessages(
      pinnedMessages.filter((m) => m.messageId !== messageId)
    );
  };

  const handleMessageSelect = (message: PinnedMessage) => {
    setSelectedMessage(message);
    setShowDetails(true);
    if (onMessageSelect) {
      onMessageSelect(message.messageId);
    }
  };

  const renderPinnedMessage = (message: PinnedMessage) => {
    return (
      <TouchableOpacity
        key={message.id}
        onPress={() => handleMessageSelect(message)}
        className="mb-3 p-4 rounded-lg border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-primary">
              📌 {message.senderName}
            </Text>
            <Text
              className="text-xs text-muted mt-1"
              numberOfLines={1}
            >
              {message.pinnedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleUnpin(message.messageId)}
            className="p-2"
          >
            <Text className="text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <Text
          className="text-base text-foreground leading-relaxed"
          numberOfLines={3}
        >
          {message.messageText}
        </Text>

        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center border"
            style={{ borderColor: colors.primary }}
          >
            <Text className="text-xs text-primary font-semibold">View in Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-xs text-background font-semibold">Forward</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-4xl mb-4">📌</Text>
      <Text className="text-lg font-semibold text-foreground mb-2">
        No Pinned Messages
      </Text>
      <Text className="text-sm text-muted text-center px-4">
        Pin important messages to keep them at the top of the conversation for easy reference
      </Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="justify-between">
      {/* Header */}
      <View className="pb-3 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-lg font-bold text-foreground">Pinned Messages</Text>
        <Text className="text-sm text-muted">
          {pinnedMessages.length} message{pinnedMessages.length !== 1 ? "s" : ""} pinned
        </Text>
      </View>

      {/* Pinned Messages List */}
      {pinnedMessages.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {pinnedMessages.map((msg) => renderPinnedMessage(msg))}
        </ScrollView>
      )}

      {/* Message Details Modal */}
      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: `${colors.background}99` }}
        >
          <View
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-6"
            style={{ backgroundColor: colors.background }}
          >
            {selectedMessage && (
              <>
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">
                      {selectedMessage.senderName}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      Pinned {selectedMessage.pinnedAt.toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowDetails(false)}
                    className="p-2"
                  >
                    <Text className="text-2xl">✕</Text>
                  </TouchableOpacity>
                </View>

                <View
                  className="p-4 rounded-lg mb-4"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-base text-foreground leading-relaxed">
                    {selectedMessage.messageText}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setShowDetails(false)}
                    className="flex-1 py-3 rounded-lg items-center border"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-sm font-semibold text-foreground">
                      Close
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-lg items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-sm font-semibold text-background">
                      Forward
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
