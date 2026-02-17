import { ScrollView, Text, View, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const MOCK_RIDES = [
  {
    id: "1",
    driver: "John Driver",
    from: "123 Main St",
    to: "456 Oak Ave",
    date: "Today at 2:30 PM",
    fare: "$12.50",
    rating: 5,
  },
  {
    id: "2",
    driver: "Sarah Smith",
    from: "789 Pine Rd",
    to: "321 Elm St",
    date: "Yesterday at 6:15 PM",
    fare: "$8.75",
    rating: 4,
  },
  {
    id: "3",
    driver: "Mike Johnson",
    from: "555 Maple Dr",
    to: "999 Cedar Ln",
    date: "Feb 15 at 10:45 AM",
    fare: "$15.20",
    rating: 5,
  },
];

export default function RiderHistoryScreen() {
  const colors = useColors();

  const renderRideItem = ({ item }: { item: (typeof MOCK_RIDES)[0] }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-foreground font-semibold mb-1">{item.driver}</Text>
          <Text className="text-muted text-sm mb-2">{item.date}</Text>
        </View>
        <Text className="text-foreground font-bold text-lg">{item.fare}</Text>
      </View>

      <View className="border-t border-border pt-3">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-muted">📍</Text>
          <Text className="text-muted text-sm flex-1">{item.from}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-muted">📍</Text>
          <Text className="text-muted text-sm flex-1">{item.to}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1 mt-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Text key={i} className="text-lg">
            {i < item.rating ? "⭐" : "☆"}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-foreground mb-4">Ride History</Text>

        {MOCK_RIDES.length > 0 ? (
          <FlatList
            data={MOCK_RIDES}
            renderItem={renderRideItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-lg">No rides yet</Text>
            <Text className="text-muted text-sm mt-2">Your ride history will appear here</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
