import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  status: "success" | "failure";
  timestamp: string;
  details?: string;
}

interface SuspiciousActivity {
  type: string;
  userId: string;
  details: string;
  severity: "low" | "medium" | "high";
}

export default function AuditLogsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"logs" | "suspicious">("logs");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("");

  // Mock data - will be replaced with real API calls
  const auditLogs: AuditLog[] = [
    {
      id: "audit-1",
      userId: "user-123",
      action: "ride_created",
      resource: "rides",
      status: "success",
      timestamp: "2026-02-20T10:30:00Z",
      details: "Rider created ride request",
    },
    {
      id: "audit-2",
      userId: "user-456",
      action: "login",
      resource: "auth",
      status: "success",
      timestamp: "2026-02-20T10:25:00Z",
    },
    {
      id: "audit-3",
      userId: "user-789",
      action: "payment_processed",
      resource: "payments",
      status: "success",
      timestamp: "2026-02-20T10:20:00Z",
      details: "Payment of $25.50 processed",
    },
    {
      id: "audit-4",
      userId: "user-101",
      action: "login",
      resource: "auth",
      status: "failure",
      timestamp: "2026-02-20T10:15:00Z",
      details: "Invalid credentials",
    },
  ];

  const suspiciousActivities: SuspiciousActivity[] = [
    {
      type: "multiple_failed_logins",
      userId: "user-202",
      details: "7 failed login attempts",
      severity: "high",
    },
    {
      type: "unusual_activity_volume",
      userId: "user-303",
      details: "156 actions in 1 hour",
      severity: "medium",
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userId.includes(searchQuery) ||
      log.action.includes(searchQuery) ||
      log.details?.includes(searchQuery);
    const matchesAction = !filterAction || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-error/20";
      case "medium":
        return "bg-warning/20";
      case "low":
        return "bg-primary/20";
      default:
        return "bg-surface";
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-error";
      case "medium":
        return "text-warning";
      case "low":
        return "text-primary";
      default:
        return "text-foreground";
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Audit Logs</Text>
          <Text className="text-sm text-muted">Track all platform activities</Text>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row gap-2 mb-6 bg-surface rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("logs")}
            className={`flex-1 rounded-lg py-2 ${activeTab === "logs" ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "logs" ? "text-white" : "text-foreground"
              }`}
            >
              Logs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("suspicious")}
            className={`flex-1 rounded-lg py-2 ${activeTab === "suspicious" ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "suspicious" ? "text-white" : "text-foreground"
              }`}
            >
              Suspicious
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <>
            {/* Search */}
            <View className="mb-4">
              <TextInput
                placeholder="Search by user ID, action, or details..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-surface border border-border rounded-lg p-3 text-foreground mb-3"
                placeholderTextColor={colors.muted}
              />

              {/* Action Filter */}
              <View className="flex-row gap-2 flex-wrap">
                {["ride_created", "login", "payment_processed"].map((action) => (
                  <TouchableOpacity
                    key={action}
                    onPress={() => setFilterAction(filterAction === action ? "" : action)}
                    className={`px-3 py-1 rounded-full border ${
                      filterAction === action
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        filterAction === action ? "text-white" : "text-foreground"
                      }`}
                    >
                      {action}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logs List */}
            <View className="gap-3">
              {filteredLogs.length === 0 ? (
                <View className="bg-surface rounded-lg p-6 items-center">
                  <Text className="text-muted text-center">No logs found</Text>
                </View>
              ) : (
                filteredLogs.map((log) => (
                  <View key={log.id} className="bg-surface rounded-lg p-4 border border-border">
                    {/* Header */}
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">{log.action}</Text>
                        <Text className="text-xs text-muted">{log.userId}</Text>
                      </View>
                      <View
                        className={`px-2 py-1 rounded ${
                          log.status === "success" ? "bg-success/20" : "bg-error/20"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            log.status === "success" ? "text-success" : "text-error"
                          }`}
                        >
                          {log.status}
                        </Text>
                      </View>
                    </View>

                    {/* Details */}
                    {log.details && (
                      <Text className="text-xs text-muted mb-2 italic">{log.details}</Text>
                    )}

                    {/* Timestamp */}
                    <Text className="text-xs text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* Suspicious Activity Tab */}
        {activeTab === "suspicious" && (
          <View className="gap-3">
            {suspiciousActivities.length === 0 ? (
              <View className="bg-surface rounded-lg p-6 items-center">
                <Text className="text-muted text-center">No suspicious activities detected</Text>
              </View>
            ) : (
              suspiciousActivities.map((activity, index) => (
                <View
                  key={index}
                  className={`rounded-lg p-4 border border-border ${getSeverityColor(activity.severity)}`}
                >
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {activity.type.replace(/_/g, " ")}
                      </Text>
                      <Text className="text-xs text-muted">{activity.userId}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${getSeverityColor(activity.severity)}`}>
                      <Text className={`text-xs font-semibold ${getSeverityTextColor(activity.severity)}`}>
                        {activity.severity}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <Text className="text-sm text-foreground">{activity.details}</Text>

                  {/* Action Button */}
                  <TouchableOpacity className="mt-3 bg-primary/20 rounded-lg p-2 active:opacity-80">
                    <Text className="text-primary font-semibold text-center text-sm">
                      Review User
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
