/**
 * Accessibility Features Service
 * Provides voice commands, text-to-speech, and accessibility options
 */

export interface AccessibilitySettings {
  userId: string;
  voiceCommandsEnabled: boolean;
  textToSpeechEnabled: boolean;
  highContrastMode: boolean;
  largeTextSize: boolean;
  screenReaderOptimized: boolean;
  hapticFeedbackEnabled: boolean;
  reducedMotionEnabled: boolean;
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  language: string;
  voiceSpeed: number; // 0.5 to 2.0
  voiceVolume: number; // 0 to 100
}

export interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  description: string;
  category: "navigation" | "ride" | "payment" | "support";
  keywords: string[];
  enabled: boolean;
}

export interface TextToSpeechOptions {
  text: string;
  language: string;
  speed: number;
  volume: number;
  pitch: number;
}

/**
 * Accessibility Service
 */
export class AccessibilityService {
  private userSettings: Map<string, AccessibilitySettings> = new Map();
  private voiceCommands: Map<string, VoiceCommand> = new Map();
  private speechQueue: TextToSpeechOptions[] = [];

  /**
   * Initialize accessibility settings for user
   */
  initializeSettings(userId: string): AccessibilitySettings {
    const settings: AccessibilitySettings = {
      userId,
      voiceCommandsEnabled: false,
      textToSpeechEnabled: false,
      highContrastMode: false,
      largeTextSize: false,
      screenReaderOptimized: false,
      hapticFeedbackEnabled: true,
      reducedMotionEnabled: false,
      colorBlindMode: "none",
      language: "en",
      voiceSpeed: 1.0,
      voiceVolume: 100,
    };

    this.userSettings.set(userId, settings);
    return settings;
  }

  /**
   * Get user accessibility settings
   */
  getSettings(userId: string): AccessibilitySettings | undefined {
    return this.userSettings.get(userId);
  }

  /**
   * Update accessibility settings
   */
  updateSettings(userId: string, updates: Partial<AccessibilitySettings>): AccessibilitySettings {
    let settings = this.userSettings.get(userId);
    if (!settings) {
      settings = this.initializeSettings(userId);
    }

    const updated = { ...settings, ...updates, userId };
    this.userSettings.set(userId, updated);
    return updated;
  }

  /**
   * Register voice command
   */
  registerVoiceCommand(command: VoiceCommand): void {
    this.voiceCommands.set(command.id, command);
  }

  /**
   * Get available voice commands
   */
  getVoiceCommands(category?: string): VoiceCommand[] {
    const commands = Array.from(this.voiceCommands.values());
    if (category) {
      return commands.filter((c) => c.category === category && c.enabled);
    }
    return commands.filter((c) => c.enabled);
  }

  /**
   * Process voice command
   */
  processVoiceCommand(
    userId: string,
    voiceInput: string
  ): { command: VoiceCommand; confidence: number } | null {
    const settings = this.getSettings(userId);
    if (!settings || !settings.voiceCommandsEnabled) {
      return null;
    }

    const input = voiceInput.toLowerCase().trim();
    let bestMatch: { command: VoiceCommand; confidence: number } | null = null;

    for (const command of this.voiceCommands.values()) {
      if (!command.enabled) continue;

      // Check exact match
      if (input === command.command.toLowerCase()) {
        return { command, confidence: 1.0 };
      }

      // Check keyword match
      for (const keyword of command.keywords) {
        if (input.includes(keyword.toLowerCase())) {
          const confidence = this.calculateSimilarity(input, keyword);
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = { command, confidence };
          }
        }
      }
    }

    return bestMatch && bestMatch.confidence > 0.7 ? bestMatch : null;
  }

  /**
   * Queue text-to-speech
   */
  queueSpeech(userId: string, text: string): void {
    const settings = this.getSettings(userId);
    if (!settings || !settings.textToSpeechEnabled) {
      return;
    }

    this.speechQueue.push({
      text,
      language: settings.language,
      speed: settings.voiceSpeed,
      volume: settings.voiceVolume,
      pitch: 1.0,
    });
  }

  /**
   * Get next speech in queue
   */
  getNextSpeech(): TextToSpeechOptions | undefined {
    return this.speechQueue.shift();
  }

  /**
   * Clear speech queue
   */
  clearSpeechQueue(): void {
    this.speechQueue = [];
  }

  /**
   * Get speech queue length
   */
  getSpeechQueueLength(): number {
    return this.speechQueue.length;
  }

  /**
   * Apply high contrast mode colors
   */
  getHighContrastColors(isDarkMode: boolean): {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
  } {
    if (isDarkMode) {
      return {
        background: "#000000",
        foreground: "#FFFF00",
        primary: "#00FF00",
        secondary: "#FF00FF",
      };
    } else {
      return {
        background: "#FFFFFF",
        foreground: "#000000",
        primary: "#0000FF",
        secondary: "#FF0000",
      };
    }
  }

  /**
   * Apply color blind mode filter
   */
  applyColorBlindFilter(
    mode: "none" | "protanopia" | "deuteranopia" | "tritanopia"
  ): string {
    const filters: Record<string, string> = {
      none: "none",
      protanopia: "url(#protanopia-filter)",
      deuteranopia: "url(#deuteranopia-filter)",
      tritanopia: "url(#tritanopia-filter)",
    };
    return filters[mode] || "none";
  }

  /**
   * Get font size multiplier
   */
  getFontSizeMultiplier(largeTextEnabled: boolean): number {
    return largeTextEnabled ? 1.25 : 1.0;
  }

  /**
   * Get animation settings
   */
  getAnimationSettings(reducedMotionEnabled: boolean): {
    duration: number;
    enabled: boolean;
  } {
    return {
      duration: reducedMotionEnabled ? 0 : 300,
      enabled: !reducedMotionEnabled,
    };
  }

  /**
   * Generate accessibility report
   */
  generateAccessibilityReport(userId: string): {
    userId: string;
    featuresEnabled: string[];
    recommendations: string[];
    score: number;
  } {
    const settings = this.getSettings(userId);
    if (!settings) {
      return {
        userId,
        featuresEnabled: [],
        recommendations: ["Enable accessibility features in settings"],
        score: 0,
      };
    }

    const featuresEnabled: string[] = [];
    if (settings.voiceCommandsEnabled) featuresEnabled.push("Voice Commands");
    if (settings.textToSpeechEnabled) featuresEnabled.push("Text-to-Speech");
    if (settings.highContrastMode) featuresEnabled.push("High Contrast Mode");
    if (settings.largeTextSize) featuresEnabled.push("Large Text");
    if (settings.screenReaderOptimized) featuresEnabled.push("Screen Reader");
    if (settings.reducedMotionEnabled) featuresEnabled.push("Reduced Motion");

    const recommendations: string[] = [];
    if (!settings.voiceCommandsEnabled) {
      recommendations.push("Enable voice commands for hands-free operation");
    }
    if (!settings.textToSpeechEnabled) {
      recommendations.push("Enable text-to-speech for audio guidance");
    }
    if (!settings.screenReaderOptimized) {
      recommendations.push("Enable screen reader optimization");
    }

    const score = (featuresEnabled.length / 6) * 100;

    return {
      userId,
      featuresEnabled,
      recommendations,
      score: Math.round(score),
    };
  }

  /**
   * Calculate string similarity for voice command matching
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private getEditDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let k = 0; k <= s1.length; k++) {
      let lastValue = k;
      for (let i = 0; i <= s2.length; i++) {
        if (k === 0) {
          costs[i] = i;
        } else if (i > 0) {
          let newValue = costs[i - 1];
          if (s1.charAt(k - 1) !== s2.charAt(i - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[i]) + 1;
          }
          costs[i - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (k > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Get accessibility guidelines
   */
  getAccessibilityGuidelines(): {
    title: string;
    description: string;
    tips: string[];
  }[] {
    return [
      {
        title: "Voice Commands",
        description: "Control the app hands-free using voice commands",
        tips: [
          "Say 'Request Ride' to book a ride",
          "Say 'Show Earnings' to view driver earnings",
          "Say 'Contact Support' for help",
        ],
      },
      {
        title: "Text-to-Speech",
        description: "Hear important information read aloud",
        tips: [
          "Adjust voice speed in accessibility settings",
          "Choose your preferred language",
          "Enable for navigation and ride updates",
        ],
      },
      {
        title: "High Contrast Mode",
        description: "Improve visibility with high contrast colors",
        tips: [
          "Easier to read in bright sunlight",
          "Reduces eye strain for some users",
          "Works in both light and dark modes",
        ],
      },
      {
        title: "Large Text",
        description: "Increase text size for better readability",
        tips: [
          "25% larger text throughout the app",
          "Maintains layout and functionality",
          "Combine with high contrast for best results",
        ],
      },
      {
        title: "Reduced Motion",
        description: "Minimize animations and transitions",
        tips: [
          "Reduces motion sickness for sensitive users",
          "Speeds up app performance",
          "Maintains all functionality",
        ],
      },
      {
        title: "Color Blind Mode",
        description: "Adapt colors for color blindness types",
        tips: [
          "Choose your specific color blindness type",
          "Improves visibility of status indicators",
          "Works with all other accessibility features",
        ],
      },
    ];
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();
