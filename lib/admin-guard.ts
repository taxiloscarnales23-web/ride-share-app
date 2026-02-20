import { useAuth } from "@/hooks/use-auth";

export interface UserWithRole {
  id: string;
  email: string;
  role: "admin" | "driver" | "rider" | "support";
  createdAt: string;
}

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  const userWithRole = user as any;
  return userWithRole?.role === "admin";
}

/**
 * Hook to get current user's role
 */
export function useUserRole(): string | null {
  const { user } = useAuth();
  const userWithRole = user as any;
  return userWithRole?.role || null;
}

/**
 * Check if user has specific role
 */
export function hasRole(user: UserWithRole | null | undefined, role: string): boolean {
  const userWithRole = user as any;
  return userWithRole?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserWithRole | null | undefined, roles: string[]): boolean {
  const userWithRole = user as any;
  return userWithRole ? roles.includes(userWithRole.role) : false;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, "admin");
}

/**
 * Check if user is driver
 */
export function isDriver(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, "driver");
}

/**
 * Check if user is rider
 */
export function isRider(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, "rider");
}

/**
 * Check if user is support staff
 */
export function isSupport(user: UserWithRole | null | undefined): boolean {
  return hasRole(user, "support");
}

/**
 * Get admin-only features availability
 */
export function getAdminFeatures(user: UserWithRole | null | undefined) {
  const adminOnly = isAdmin(user);

  return {
    webhooks: adminOnly,
    auditLogs: adminOnly,
    userManagement: adminOnly,
    systemSettings: adminOnly,
    analytics: adminOnly,
  };
}

/**
 * Get role-based feature access
 */
export function getFeatureAccess(user: UserWithRole | null | undefined) {
  const userWithRole = user as any;
  const role = user?.role;

  return {
    // Admin features
    webhooks: role === "admin",
    auditLogs: role === "admin",
    userManagement: role === "admin",
    systemSettings: role === "admin",
    analytics: role === "admin",

    // Driver features
    driverDashboard: role === "driver" || role === "admin",
    earnings: role === "driver" || role === "admin",
    vehicleManagement: role === "driver" || role === "admin",
    driverRatings: role === "driver" || role === "admin",

    // Rider features
    rideHistory: role === "rider" || role === "admin",
    savedLocations: role === "rider" || role === "admin",
    paymentMethods: role === "rider" || role === "admin",
    riderRatings: role === "rider" || role === "admin",

    // Universal features
    twoFactorAuth: true,
    accountSettings: true,
    supportChat: true,
  };
}
