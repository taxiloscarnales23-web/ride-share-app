import { ScrollView, Text, View, FlatList, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const MOCK_EARNINGS = [
  {
    id: "1",
    passenger: "Jane Smith",
    fare: "$12.50",
    tip: "$2.00",
    total: "$14.50",
    time: "Today at 2:30 PM",
  },
  {
    id: "2",
    passenger: "Bob Johnson",
    fare: "$8.75",
    tip: "$0.00",
    total: "$8.75",
    time: "Today at 1:15 PM",
  },
  {
    id: "3",
    passenger: "Alice Brown",
    fare: "$15.20",
    tip: "$3.00",
    total: "$18.20",
    time: "Today at 11:45 AM",
  },
];

export default function DriverEarningsScreen() {
  const colors = useColors();

  const totalEarnings = MOCK_EARNINGS.reduce((sum, ride) => {
    const amount = parseFloat(ride.total.replace("$", ""));
    return sum + amount;
  }, 0);

  const renderEarningItem = ({ item }: { item: (typeof MOCK_EARNINGS)[0] }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-foreground font-semibold mb-1">{item.passenger}</Text>
          <Text className="text-muted text-sm">{item.time}</Text>
        </View>
        <Text className="text-success font-bold text-lg">{item.total}</Text>
      </View>

      <View className="border-t border-border pt-3 flex-row justify-between">
        <View>
          <Text className="text-muted text-xs">Fare</Text>
          <Text className="text-foreground font-semibold">{item.fare}</Text>
        </View>
        <View>
          <Text className="text-muted text-xs">Tip</Text>
          <Text className="text-foreground font-semibold">{item.tip}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text className="text-2xl font-bold text-foreground mb-6">Earnings</Text>

        {/* Today's Summary */}
        <View className="bg-surface rounded-lg p-6 border border-border mb-8">
          <Text className="text-muted text-sm mb-2">Today's Earnings</Text>
          <Text
            className="text-4xl font-bold mb-4"
            style={{ color: colors.success }}
          >
            ${totalEarnings.toFixed(2)}
          </Text>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-muted text-xs mb-1">Rides</Text>
              <Text className="text-foreground font-semibold text-lg">{MOCK_EARNINGS.length}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-muted text-xs mb-1">Avg. Fare</Text>
              <Text className="text-foreground font-semibold text-lg">
                ${(totalEarnings / MOCK_EARNINGS.length).toFixed(2)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-muted text-xs mb-1">Rating</Text>
              <Text className="text-foreground font-semibold text-lg">4.8 ⭐</Text>
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View className="flex-row gap-2 mb-6">
          {["Today", "Week", "Month"].map((period) => (
            <Pressable
              key={period}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View
                className={`px-4 py-2 rounded-lg border ${
                  period === "Today" ? "border-primary" : "border-border"
                }`}
                style={{
                  backgroundColor: period === "Today" ? colors.primary : "transparent",
                }}
              >
                <Text
                  className={period === "Today" ? "text-white font-semibold" : "text-foreground"}
                >
                  {period}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Ride History */}
        <Text className="text-lg font-semibold text-foreground mb-3">Ride Details</Text>
        <FlatList
          data={MOCK_EARNINGS}
          renderItem={renderEarningItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </ScreenContainer>
  );
}


