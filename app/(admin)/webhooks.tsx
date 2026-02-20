import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { AdminRoute } from "@/components/admin-route";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  failureCount: number;
}

const WEBHOOK_EVENTS = [
  "ride.created",
  "ride.accepted",
  "ride.started",
  "ride.completed",
  "ride.cancelled",
  "payment.processed",
  "user.registered",
];

// Mock webhook storage - in production, this would be replaced with tRPC calls
const mockWebhooks: WebhookEndpoint[] = [
  {
    id: "wh-1",
    url: "https://example.com/webhooks/rides",
    events: ["ride.created", "ride.completed"],
    active: true,
    failureCount: 0,
  },
];

export default function WebhooksScreen() {
  const colors = useColors();
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleAddWebhook = async () => {
    if (!newUrl.trim() || selectedEvents.length === 0) {
      Alert.alert("Error", "Please enter a URL and select at least one event");
      return;
    }

    try {
      setLoading(true);
      // Mock API call - replace with real tRPC call
      const newWebhook: WebhookEndpoint = {
        id: `wh-${Date.now()}`,
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
    } finally {
      setLoading(false);
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
            setLoading(true);
            // Mock API call - replace with real tRPC call
            setWebhooks(webhooks.filter((w) => w.id !== id));
            Alert.alert("Success", "Webhook deleted");
          } catch (error) {
            console.error("Failed to delete webhook:", error);
            Alert.alert("Error", "Failed to delete webhook");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleTestWebhook = async (id: string) => {
    try {
      setLoading(true);
      // Mock API call - replace with real tRPC call
      Alert.alert("Test Result", "Webhook test sent successfully");
    } catch (error) {
      console.error("Failed to test webhook:", error);
      Alert.alert("Error", "Failed to test webhook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <ScreenContainer className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-2">Webhooks</Text>
            <Text className="text-sm text-muted">Manage third-party integrations</Text>
          </View>

          {/* Add Webhook Button */}
          {!showForm && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="bg-primary rounded-lg p-4 mb-6 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">+ Add Webhook</Text>
            </TouchableOpacity>
          )}

          {/* Registration Form */}
          {showForm && (
            <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">Register Webhook</Text>

              <TextInput
                placeholder="https://example.com/webhooks"
                value={newUrl}
                onChangeText={setNewUrl}
                className="bg-background border border-border rounded-lg p-3 text-foreground mb-3"
                placeholderTextColor={colors.muted}
              />

              <Text className="text-sm font-semibold text-foreground mb-2">Select Events:</Text>
              <View className="gap-2 mb-4">
                {WEBHOOK_EVENTS.map((event) => (
                  <TouchableOpacity
                    key={event}
                    onPress={() => handleToggleEvent(event)}
                    className={`p-3 rounded-lg border ${
                      selectedEvents.includes(event)
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`${
                        selectedEvents.includes(event) ? "text-white" : "text-foreground"
                      }`}
                    >
                      {event}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleAddWebhook}
                disabled={loading}
                className="bg-success rounded-lg p-3 mb-2 active:opacity-80"
              >
                <Text className="text-white font-semibold text-center">
                  {loading ? "Registering..." : "Register Webhook"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForm(false)}
                className="bg-muted/20 rounded-lg p-3 active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Active Webhooks */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Active Webhooks</Text>
            {webhooks.length === 0 ? (
              <View className="bg-surface rounded-lg p-6 items-center border border-border">
                <Text className="text-muted text-center">No webhooks registered yet</Text>
              </View>
            ) : (
              <View className="gap-3">
                {webhooks.map((webhook) => (
                  <View key={webhook.id} className="bg-surface rounded-lg p-4 border border-border">
                    {/* URL */}
                    <Text className="text-sm font-semibold text-foreground mb-2">{webhook.url}</Text>

                    {/* Events */}
                    <View className="flex-row flex-wrap gap-1 mb-3">
                      {webhook.events.map((event) => (
                        <View key={event} className="bg-primary/20 rounded px-2 py-1">
                          <Text className="text-xs text-primary">{event}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Status */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`w-2 h-2 rounded-full ${
                            webhook.active ? "bg-success" : "bg-error"
                          }`}
                        />
                        <Text className={`text-xs ${webhook.active ? "text-success" : "text-error"}`}>
                          {webhook.active ? "Active" : "Inactive"}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted">Failures: {webhook.failureCount}</Text>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleTestWebhook(webhook.id)}
                        disabled={loading}
                        className="flex-1 bg-primary/20 rounded-lg p-2 active:opacity-80"
                      >
                        <Text className="text-primary font-semibold text-center text-sm">Test</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteWebhook(webhook.id)}
                        disabled={loading}
                        className="flex-1 bg-error/20 rounded-lg p-2 active:opacity-80"
                      >
                        <Text className="text-error font-semibold text-center text-sm">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    </AdminRoute>
  );
}
