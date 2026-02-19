import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

export default function DriverHeatmapScreen() {
  const colors = useColors();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("24h");

  // Mock heatmap data - areas with driver density
  const heatmapAreas = [
    {
      id: "downtown",
      name: "Downtown",
      drivers: 34,
      demand: "High",
      avgEarnings: 245,
      color: "#EF4444",
      density: 95,
    },
    {
      id: "airport",
      name: "Airport",
      drivers: 28,
      demand: "High",
      avgEarnings: 312,
      color: "#F97316",
      density: 85,
    },
    {
      id: "station",
      name: "Central Station",
      drivers: 22,
      demand: "Medium",
      avgEarnings: 198,
      color: "#FBBF24",
      density: 65,
    },
    {
      id: "hospital",
      name: "Hospital District",
      drivers: 15,
      demand: "Medium",
      avgEarnings: 156,
      color: "#A3E635",
      density: 45,
    },
    {
      id: "suburbs",
      name: "Suburbs",
      drivers: 8,
      demand: "Low",
      avgEarnings: 89,
      color: "#86EFAC",
      density: 20,
    },
  ];

  const peakHours = [
    { hour: "6-7am", drivers: 12, demand: "Low" },
    { hour: "7-9am", drivers: 45, demand: "High" },
    { hour: "9-12pm", drivers: 28, demand: "Medium" },
    { hour: "12-2pm", drivers: 35, demand: "High" },
    { hour: "2-5pm", drivers: 22, demand: "Medium" },
    { hour: "5-7pm", drivers: 52, demand: "Very High" },
    { hour: "7-10pm", drivers: 38, demand: "High" },
    { hour: "10pm-6am", drivers: 15, demand: "Low" },
  ];

  const recommendations = [
    {
      area: "Downtown",
      action: "Incentivize drivers",
      reason: "High demand, moderate supply",
    },
    {
      area: "Airport",
      action: "Maintain current levels",
      reason: "Balanced supply and demand",
    },
    {
      area: "Suburbs",
      action: "Recruit more drivers",
      reason: "Growing demand, low supply",
    },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Driver Heatmap
            </Text>
            <Text className="text-sm text-muted">
              Real-time driver density and demand visualization
            </Text>
          </View>

          {/* Time Range Selector */}
          <View className="flex-row gap-2">
            {(["1h", "24h", "7d"] as const).map((range) => (
              <Pressable
                key={range}
                onPress={() => setTimeRange(range)}
                style={({ pressed }) => [
                  {
                    backgroundColor:
                      timeRange === range ? colors.primary : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 py-2 px-3 rounded-lg items-center"
              >
                <Text
                  className={`font-semibold text-xs ${
                    timeRange === range ? "text-background" : "text-foreground"
                  }`}
                >
                  {range}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Heatmap Grid */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Driver Density by Area
            </Text>
            <View className="gap-2">
              {heatmapAreas.map((area) => (
                <Pressable
                  key={area.id}
                  onPress={() =>
                    setSelectedArea(selectedArea === area.id ? null : area.id)
                  }
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  {/* Area Header */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-base font-semibold text-foreground">
                      {area.name}
                    </Text>
                    <Text
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: area.color + "20", color: area.color }}
                    >
                      {area.demand}
                    </Text>
                  </View>

                  {/* Density Bar */}
                  <View className="mb-3">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-muted">Density</Text>
                      <Text className="text-xs font-semibold text-foreground">
                        {area.density}%
                      </Text>
                    </View>
                    <View
                      className="h-2 bg-border rounded-full overflow-hidden"
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${area.density}%`,
                          backgroundColor: area.color,
                        }}
                      />
                    </View>
                  </View>

                  {/* Area Stats */}
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-xs text-muted">Active Drivers</Text>
                      <Text className="text-lg font-bold text-foreground">
                        {area.drivers}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Avg Earnings</Text>
                      <Text className="text-lg font-bold text-primary">
                        ${area.avgEarnings}
                      </Text>
                    </View>
                  </View>

                  {/* Expanded Details */}
                  {selectedArea === area.id && (
                    <View className="mt-4 pt-4 border-t border-border gap-2">
                      <Text className="text-sm font-semibold text-foreground">
                        Recommendations:
                      </Text>
                      <Text className="text-xs text-muted">
                        • Optimize driver allocation based on demand patterns
                      </Text>
                      <Text className="text-xs text-muted">
                        • Monitor peak hours for surge pricing opportunities
                      </Text>
                      <Text className="text-xs text-muted">
                        • Target incentives to attract more drivers if needed
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Peak Hours Analysis */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Peak Hours Analysis
            </Text>
            <View className="bg-surface rounded-lg p-4 gap-3">
              {peakHours.map((hour, index) => (
                <View
                  key={index}
                  className={`flex-row justify-between items-center ${
                    index !== peakHours.length - 1 ? "pb-3 border-b border-border" : ""
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {hour.hour}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {hour.drivers} drivers • {hour.demand}
                    </Text>
                  </View>
                  <View
                    className="w-12 h-8 rounded items-center justify-center"
                    style={{
                      backgroundColor: colors.primary + "20",
                    }}
                  >
                    <Text className="text-xs font-bold text-primary">
                      {hour.drivers}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* AI Recommendations */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              AI Recommendations
            </Text>
            <View className="gap-2">
              {recommendations.map((rec, index) => (
                <View
                  key={index}
                  className="bg-surface rounded-lg p-4 border-l-4"
                  style={{ borderLeftColor: colors.primary }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-sm font-semibold text-foreground flex-1">
                      {rec.area}
                    </Text>
                    <Text className="text-xs font-semibold text-primary">
                      {rec.action}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted">{rec.reason}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-2">
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="py-3 px-4 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">
                Export Heatmap Data
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="py-3 px-4 rounded-lg items-center border border-border"
            >
              <Text className="text-foreground font-semibold">
                Configure Alerts
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
