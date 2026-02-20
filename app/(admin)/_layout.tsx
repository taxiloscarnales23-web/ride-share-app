import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function AdminLayout() {
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
        name="webhooks"
        options={{
          title: "Webhooks",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="audit-logs"
        options={{
          title: "Audit Logs",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
