export interface TwoFAConfig {
  userId: string;
  enabled: boolean;
  method: "totp" | "sms" | "both";
  totpSecret?: string;
  phoneNumber?: string;
  backupCodes: string[];
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface TwoFAChallenge {
  id: string;
  userId: string;
  method: "totp" | "sms";
  code: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

export class TwoFAService {
  private configs: Map<string, TwoFAConfig> = new Map();
  private challenges: Map<string, TwoFAChallenge> = new Map();

  /**
   * Enable 2FA for user
   */
  async enable(userId: string, method: "totp" | "sms" | "both", phoneNumber?: string): Promise<TwoFAConfig> {
    const config: TwoFAConfig = {
      userId,
      enabled: true,
      method,
      totpSecret: this.generateTOTPSecret(),
      phoneNumber,
      backupCodes: this.generateBackupCodes(10),
      createdAt: new Date(),
    };

    this.configs.set(userId, config);
    console.log(`2FA enabled for user ${userId} with method: ${method}`);

    return config;
  }

  /**
   * Disable 2FA for user
   */
  async disable(userId: string): Promise<boolean> {
    const config = this.configs.get(userId);
    if (config) {
      config.enabled = false;
      console.log(`2FA disabled for user ${userId}`);
      return true;
    }
    return false;
  }

  /**
   * Get 2FA config
   */
  async getConfig(userId: string): Promise<TwoFAConfig | null> {
    return this.configs.get(userId) || null;
  }

  /**
   * Create 2FA challenge
   */
  async createChallenge(userId: string, method: "totp" | "sms"): Promise<TwoFAChallenge> {
    const config = this.configs.get(userId);
    if (!config || !config.enabled) {
      throw new Error("2FA not enabled for user");
    }

    const code = this.generateCode(method === "totp" ? 6 : 4);
    const challenge: TwoFAChallenge = {
      id: `challenge-${Date.now()}`,
      userId,
      method,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      verified: false,
    };

    this.challenges.set(challenge.id, challenge);

    if (method === "sms" && config.phoneNumber) {
      console.log(`SMS 2FA code sent to ${config.phoneNumber}: ${code}`);
    } else if (method === "totp") {
      console.log(`TOTP 2FA challenge created for user ${userId}`);
    }

    return challenge;
  }

  /**
   * Verify 2FA code
   */
  async verifyCode(challengeId: string, code: string): Promise<{ verified: boolean; message: string }> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return { verified: false, message: "Challenge not found" };
    }

    if (challenge.verified) {
      return { verified: false, message: "Challenge already verified" };
    }

    if (new Date() > challenge.expiresAt) {
      return { verified: false, message: "Code expired" };
    }

    challenge.attempts++;

    if (challenge.attempts > 3) {
      return { verified: false, message: "Too many attempts" };
    }

    if (challenge.code === code) {
      challenge.verified = true;
      const config = this.configs.get(challenge.userId);
      if (config) {
        config.lastUsedAt = new Date();
      }
      console.log(`2FA verified for user ${challenge.userId}`);
      return { verified: true, message: "Code verified" };
    }

    return { verified: false, message: "Invalid code" };
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<{ verified: boolean; message: string; remainingCodes?: number }> {
    const config = this.configs.get(userId);
    if (!config) {
      return { verified: false, message: "2FA not configured" };
    }

    const index = config.backupCodes.indexOf(code);
    if (index === -1) {
      return { verified: false, message: "Invalid backup code" };
    }

    // Remove used backup code
    config.backupCodes.splice(index, 1);
    config.lastUsedAt = new Date();

    console.log(`Backup code used for user ${userId}`);

    return {
      verified: true,
      message: "Backup code verified",
      remainingCodes: config.backupCodes.length,
    };
  }

  /**
   * Get backup codes
   */
  async getBackupCodes(userId: string): Promise<string[]> {
    const config = this.configs.get(userId);
    return config?.backupCodes || [];
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const config = this.configs.get(userId);
    if (!config) {
      throw new Error("2FA not configured");
    }

    config.backupCodes = this.generateBackupCodes(10);
    console.log(`Backup codes regenerated for user ${userId}`);

    return config.backupCodes;
  }

  /**
   * Get 2FA statistics
   */
  async getStats(): Promise<{
    totalUsersWithTwoFA: number;
    enabledCount: number;
    disabledCount: number;
    totpCount: number;
    smsCount: number;
    bothCount: number;
  }> {
    const configs = Array.from(this.configs.values());
    const enabledCount = configs.filter((c) => c.enabled).length;
    const disabledCount = configs.filter((c) => !c.enabled).length;
    const totpCount = configs.filter((c) => c.method === "totp" || c.method === "both").length;
    const smsCount = configs.filter((c) => c.method === "sms" || c.method === "both").length;
    const bothCount = configs.filter((c) => c.method === "both").length;

    return {
      totalUsersWithTwoFA: configs.length,
      enabledCount,
      disabledCount,
      totpCount,
      smsCount,
      bothCount,
    };
  }

  /**
   * Generate TOTP secret
   */
  private generateTOTPSecret(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate verification code
   */
  private generateCode(length: number): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, "0");
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}

export const twoFAService = new TwoFAService();
