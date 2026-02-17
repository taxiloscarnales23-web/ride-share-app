import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";

export default function DriverProfileScreen() {
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
            style={{ backgroundColor: colors.warning }}
          >
            <Text className="text-4xl">👨‍💼</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground">John Driver</Text>
          <Text className="text-muted text-sm mt-1">john.driver@example.com</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
            <Text className="text-2xl font-bold text-foreground">4.8</Text>
            <Text className="text-muted text-xs mt-1">Rating</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
            <Text className="text-2xl font-bold text-foreground">487</Text>
            <Text className="text-muted text-xs mt-1">Rides</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border items-center">
            <Text className="text-2xl font-bold text-success">$3.2K</Text>
            <Text className="text-muted text-xs mt-1">This Month</Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <View className="bg-surface rounded-lg border border-border p-4 mb-6">
          <Text className="text-foreground font-semibold mb-3">Vehicle Information</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-muted">Make & Model</Text>
              <Text className="text-foreground font-semibold">Toyota Prius 2022</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">License Plate</Text>
              <Text className="text-foreground font-semibold">ABC 1234</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">Color</Text>
              <Text className="text-foreground font-semibold">Silver</Text>
            </View>
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
              <Text className="text-foreground">Bank Account</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="p-4"
            >
              <Text className="text-foreground">Documents</Text>
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
            className="py-4 rounded-lg items-center justify-center border border-primary"
            style={{ backgroundColor: "transparent" }}
          >
            <Text className="text-primary font-bold">Switch to Rider Mode</Text>
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
