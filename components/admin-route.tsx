import { useIsAdmin } from "@/lib/admin-guard";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";
import { ScreenContainer } from "./screen-container";
import { useColors } from "@/hooks/use-colors";

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Protected route component that only allows admin users
 * Redirects non-admin users to home screen
 */
export function AdminRoute({ children, fallback }: AdminRouteProps) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (!isAdmin) {
      // Redirect non-admin users to home
      router.replace("/");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ScreenContainer className="flex-1 bg-background items-center justify-center">
        <Text className="text-lg font-semibold text-foreground mb-2">Access Denied</Text>
        <Text className="text-sm text-muted text-center">
          You don't have permission to access this page
        </Text>
      </ScreenContainer>
    );
  }

  return <>{children}</>;
}

/**
 * Wrapper for admin screens
 */
export function withAdminRoute<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AdminProtectedComponent(props: P) {
    return (
      <AdminRoute>
        <Component {...props} />
      </AdminRoute>
    );
  };
}
