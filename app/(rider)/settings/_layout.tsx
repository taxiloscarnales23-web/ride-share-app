import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function SettingsLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.foreground,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="two-factor-auth"
        options={{
          title: "Two-Factor Authentication",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
