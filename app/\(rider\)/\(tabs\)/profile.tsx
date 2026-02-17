import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";

export default function RiderProfileScreen() {
  const colors = useColors();
  const router = useRouter();

  const handleSwitchRole = () => {
    router.replace("/role-select");
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground">John Doe</Text>
          <Text className="text-muted text-sm mt-1">john.doe@example.com</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
            <Text className="text-2xl font-bold text-foreground">4.8</Text>
            <Text className="text-muted text-xs mt-1">Rating</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
            <Text className="text-2xl font-bold text-foreground">156</Text>
            <Text className="text-muted text-xs mt-1">Rides</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
            <Text className="text-2xl font-bold text-foreground">$1.2K</Text>
            <Text className="text-muted text-xs mt-1">Spent</Text>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="gap-4 mb-8">
          {/* Account Settings */}
          <View className="bg-surface rounded-lg border border-border overflow-hidden">
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4 border-b border-border"
            >
              <Text className="text-foreground font-semibold">Account Settings</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4 border-b border-border"
            >
              <Text className="text-foreground">Payment Methods</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4"
            >
              <Text className="text-foreground">Emergency Contacts</Text>
            </Pressable>
          </View>

          {/* Preferences */}
          <View className="bg-surface rounded-lg border border-border overflow-hidden">
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4 border-b border-border"
            >
              <Text className="text-foreground font-semibold">Preferences</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4 border-b border-border"
            >
              <Text className="text-foreground">Notifications</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4"
            >
              <Text className="text-foreground">Privacy & Safety</Text>
            </Pressable>
          </View>

          {/* Help & Support */}
          <View className="bg-surface rounded-lg border border-border overflow-hidden">
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4 border-b border-border"
            >
              <Text className="text-foreground font-semibold">Help & Support</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4 border-b border-border"
            >
              <Text className="text-foreground">FAQs</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4"
            >
              <Text className="text-foreground">Contact Support</Text>
            </Pressable>
          </View>
        </View>

        {/* Switch Role Button */}
        <Pressable
          onPress={handleSwitchRole}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View
            className="py-4 rounded-lg items-center justify-center border border-warning"
            style={{ backgroundColor: "transparent" }}
          >
            <Text className="text-warning font-bold">Switch to Driver Mode</Text>
          </View>
        </Pressable>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View className="py-4 rounded-lg items-center justify-center mt-3">
            <Text className="text-error font-semibold">Logout</Text>
          </View>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
