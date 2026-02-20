import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  failureCount: number;
  lastTriggeredAt?: string;
}

export default function WebhooksScreen() {
  const colors = useColors();
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const availableEvents = [
    "ride.created",
    "ride.accepted",
    "ride.started",
    "ride.completed",
    "ride.cancelled",
    "payment.processed",
    "driver.verified",
    "user.registered",
  ];

  // Fetch webhooks on mount
  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      // Mock data for now - will be replaced with real API call
      const mockWebhooks: WebhookEndpoint[] = [];
      setWebhooks(mockWebhooks);
    } catch (error) {
      console.error("Failed to load webhooks:", error);
      Alert.alert("Error", "Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebhook = async () => {
    if (!newUrl.trim() || selectedEvents.length === 0) {
      Alert.alert("Error", "Please enter a URL and select at least one event");
      return;
    }

    try {
      // Mock implementation - will be replaced with real API call
      const newWebhook: WebhookEndpoint = {
        id: `webhook-${Date.now()}`,
        url: newUrl,
        events: selectedEvents,
        active: true,
        failureCount: 0,
      };

      setWebhooks([...webhooks, newWebhook]);
      setNewUrl("");
      setSelectedEvents([]);
      setShowForm(false);
      Alert.alert("Success", "Webhook registered successfully");
    } catch (error) {
      console.error("Failed to register webhook:", error);
      Alert.alert("Error", "Failed to register webhook");
    }
  };

  const handleToggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const handleDeleteWebhook = (id: string) => {
    Alert.alert("Delete Webhook", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Mock implementation - will be replaced with real API call
            setWebhooks(webhooks.filter((w) => w.id !== id));
            Alert.alert("Success", "Webhook deleted");
          } catch (error) {
            console.error("Failed to delete webhook:", error);
            Alert.alert("Error", "Failed to delete webhook");
          }
        },
      },
    ]);
  };

  const handleTestWebhook = async (id: string) => {
    try {
      // Mock implementation - will be replaced with real API call
      Alert.alert("Test Result", "Webhook test event sent successfully");
    } catch (error) {
      console.error("Failed to test webhook:", error);
      Alert.alert("Error", "Failed to test webhook");
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Webhooks</Text>
          <Text className="text-sm text-muted">Manage third-party integrations</Text>
        </View>

        {/* Add Webhook Button */}
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          className="bg-primary rounded-lg p-4 mb-6 active:opacity-80"
        >
          <Text className="text-white font-semibold text-center">
            {showForm ? "Cancel" : "+ Add Webhook"}
          </Text>
        </TouchableOpacity>

        {/* Add Webhook Form */}
        {showForm && (
          <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">Register Webhook</Text>

            {/* URL Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Webhook URL</Text>
              <TextInput
                placeholder="https://example.com/webhooks"
                value={newUrl}
                onChangeText={setNewUrl}
                className="bg-background border border-border rounded-lg p-3 text-foreground"
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Events Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-3">Select Events</Text>
              <View className="flex-row flex-wrap gap-2">
                {availableEvents.map((event) => (
                  <TouchableOpacity
                    key={event}
                    onPress={() => handleToggleEvent(event)}
                    className={`px-3 py-2 rounded-full border ${
                      selectedEvents.includes(event)
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selectedEvents.includes(event) ? "text-white" : "text-foreground"
                      }`}
                    >
                      {event}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleAddWebhook}
              className="bg-success rounded-lg p-3 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">Register Webhook</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Webhooks List */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground mb-2">
            Active Webhooks ({webhooks.length})
          </Text>

          {loading ? (
            <View className="bg-surface rounded-lg p-6 items-center">
              <Text className="text-muted">Loading webhooks...</Text>
            </View>
          ) : webhooks.length === 0 ? (
            <View className="bg-surface rounded-lg p-6 items-center">
              <Text className="text-muted text-center">No webhooks registered yet</Text>
            </View>
          ) : (
            webhooks.map((webhook) => (
              <View key={webhook.id} className="bg-surface rounded-lg p-4 border border-border">
                {/* URL and Status */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-mono text-foreground break-words">
                      {webhook.url}
                    </Text>
                    <View className="flex-row items-center mt-2 gap-2">
                      <View
                        className={`w-2 h-2 rounded-full ${webhook.active ? "bg-success" : "bg-error"}`}
                      />
                      <Text className="text-xs text-muted">
                        {webhook.active ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Events */}
                <View className="mb-3">
                  <Text className="text-xs text-muted mb-2">Events:</Text>
                  <View className="flex-row flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <View key={event} className="bg-primary/20 rounded px-2 py-1">
                        <Text className="text-xs text-primary font-medium">{event}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Stats */}
                <View className="bg-background rounded p-2 mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-muted">Failures:</Text>
                    <Text className="text-xs font-semibold text-foreground">
                      {webhook.failureCount}
                    </Text>
                  </View>
                  {webhook.lastTriggeredAt && (
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Last triggered:</Text>
                      <Text className="text-xs font-semibold text-foreground">
                        {new Date(webhook.lastTriggeredAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleTestWebhook(webhook.id)}
                    className="flex-1 bg-primary/20 rounded-lg p-2 active:opacity-80"
                  >
                    <Text className="text-primary font-semibold text-center text-sm">Test</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteWebhook(webhook.id)}
                    className="flex-1 bg-error/20 rounded-lg p-2 active:opacity-80"
                  >
                    <Text className="text-error font-semibold text-center text-sm">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
