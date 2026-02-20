/**
 * Localization Service
 * Handles multi-language support, translations, and language preferences
 */

export type SupportedLanguage = 
  | "en" | "es" | "fr" | "de" | "it" | "pt" | "ru" | "ja" | "zh" | "ar" | "hi" | "ko";

export interface LanguageMetadata {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  dateFormat: string;
  timeFormat: string;
  currencySymbol: string;
  decimalSeparator: string;
  thousandsSeparator: string;
}

export interface TranslationKey {
  key: string;
  translations: Record<SupportedLanguage, string>;
  context?: string;
}

export interface UserLanguagePreference {
  userId: number;
  preferredLanguage: SupportedLanguage;
  secondaryLanguages: SupportedLanguage[];
  autoDetect: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Supported languages metadata
const LANGUAGE_METADATA: Record<SupportedLanguage, LanguageMetadata> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "HH:mm AM/PM",
    currencySymbol: "$",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    currencySymbol: "€",
    decimalSeparator: ",",
    thousandsSeparator: ".",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    currencySymbol: "€",
    decimalSeparator: ",",
    thousandsSeparator: " ",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    direction: "ltr",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "HH:mm",
    currencySymbol: "€",
    decimalSeparator: ",",
    thousandsSeparator: ".",
  },
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    currencySymbol: "€",
    decimalSeparator: ",",
    thousandsSeparator: ".",
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    currencySymbol: "R$",
    decimalSeparator: ",",
    thousandsSeparator: ".",
  },
  ru: {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    direction: "ltr",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "HH:mm",
    currencySymbol: "₽",
    decimalSeparator: ",",
    thousandsSeparator: " ",
  },
  ja: {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    direction: "ltr",
    dateFormat: "YYYY/MM/DD",
    timeFormat: "HH:mm",
    currencySymbol: "¥",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  zh: {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    direction: "ltr",
    dateFormat: "YYYY/MM/DD",
    timeFormat: "HH:mm",
    currencySymbol: "¥",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    currencySymbol: "﷼",
    decimalSeparator: "٫",
    thousandsSeparator: "٬",
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    currencySymbol: "₹",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  ko: {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    direction: "ltr",
    dateFormat: "YYYY/MM/DD",
    timeFormat: "HH:mm",
    currencySymbol: "₩",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
};

// Translation dictionary (in production, load from database or external service)
const TRANSLATIONS: Record<string, TranslationKey> = {
  "common.welcome": {
    key: "common.welcome",
    translations: {
      en: "Welcome",
      es: "Bienvenido",
      fr: "Bienvenue",
      de: "Willkommen",
      it: "Benvenuto",
      pt: "Bem-vindo",
      ru: "Добро пожаловать",
      ja: "ようこそ",
      zh: "欢迎",
      ar: "أهلا وسهلا",
      hi: "स्वागत है",
      ko: "환영합니다",
    },
  },
  "common.book_ride": {
    key: "common.book_ride",
    translations: {
      en: "Book a Ride",
      es: "Reservar un viaje",
      fr: "Réserver un trajet",
      de: "Fahrt buchen",
      it: "Prenota un viaggio",
      pt: "Reservar uma corrida",
      ru: "Заказать поездку",
      ja: "ライドを予約",
      zh: "预订乘车",
      ar: "احجز رحلة",
      hi: "राइड बुक करें",
      ko: "라이드 예약",
    },
  },
  "common.cancel": {
    key: "common.cancel",
    translations: {
      en: "Cancel",
      es: "Cancelar",
      fr: "Annuler",
      de: "Abbrechen",
      it: "Annulla",
      pt: "Cancelar",
      ru: "Отмена",
      ja: "キャンセル",
      zh: "取消",
      ar: "إلغاء",
      hi: "रद्द करें",
      ko: "취소",
    },
  },
  "common.confirm": {
    key: "common.confirm",
    translations: {
      en: "Confirm",
      es: "Confirmar",
      fr: "Confirmer",
      de: "Bestätigen",
      it: "Conferma",
      pt: "Confirmar",
      ru: "Подтвердить",
      ja: "確認",
      zh: "确认",
      ar: "تأكيد",
      hi: "पुष्टि करें",
      ko: "확인",
    },
  },
  "ride.pickup": {
    key: "ride.pickup",
    translations: {
      en: "Pickup Location",
      es: "Lugar de recogida",
      fr: "Lieu de prise en charge",
      de: "Abholort",
      it: "Luogo di ritiro",
      pt: "Local de retirada",
      ru: "Место подачи",
      ja: "ピックアップ場所",
      zh: "接送地点",
      ar: "موقع الاستلام",
      hi: "पिकअप स्थान",
      ko: "픽업 위치",
    },
  },
  "ride.dropoff": {
    key: "ride.dropoff",
    translations: {
      en: "Dropoff Location",
      es: "Lugar de entrega",
      fr: "Lieu de dépôt",
      de: "Abgabeort",
      it: "Luogo di consegna",
      pt: "Local de entrega",
      ru: "Место высадки",
      ja: "ドロップオフ場所",
      zh: "下车地点",
      ar: "موقع الإنزال",
      hi: "ड्रॉपऑफ स्थान",
      ko: "하차 위치",
    },
  },
  "ride.estimated_fare": {
    key: "ride.estimated_fare",
    translations: {
      en: "Estimated Fare",
      es: "Tarifa estimada",
      fr: "Tarif estimé",
      de: "Geschätzte Gebühr",
      it: "Tariffa stimata",
      pt: "Tarifa estimada",
      ru: "Приблизительная плата",
      ja: "推定料金",
      zh: "预计费用",
      ar: "الأجرة المقدرة",
      hi: "अनुमानित किराया",
      ko: "예상 요금",
    },
  },
  "driver.rating": {
    key: "driver.rating",
    translations: {
      en: "Driver Rating",
      es: "Calificación del conductor",
      fr: "Évaluation du conducteur",
      de: "Fahrerbeurteilung",
      it: "Valutazione del conducente",
      pt: "Avaliação do motorista",
      ru: "Рейтинг водителя",
      ja: "ドライバー評価",
      zh: "司机评分",
      ar: "تقييم السائق",
      hi: "ड्राइवर रेटिंग",
      ko: "운전자 평점",
    },
  },
  "payment.cash": {
    key: "payment.cash",
    translations: {
      en: "Cash",
      es: "Efectivo",
      fr: "Espèces",
      de: "Bargeld",
      it: "Contanti",
      pt: "Dinheiro",
      ru: "Наличные",
      ja: "現金",
      zh: "现金",
      ar: "نقد",
      hi: "नकद",
      ko: "현금",
    },
  },
  "error.network": {
    key: "error.network",
    translations: {
      en: "Network error. Please check your connection.",
      es: "Error de red. Por favor, verifica tu conexión.",
      fr: "Erreur réseau. Veuillez vérifier votre connexion.",
      de: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
      it: "Errore di rete. Controlla la tua connessione.",
      pt: "Erro de rede. Verifique sua conexão.",
      ru: "Ошибка сети. Проверьте ваше соединение.",
      ja: "ネットワークエラー。接続を確認してください。",
      zh: "网络错误。请检查您的连接。",
      ar: "خطأ في الشبكة. يرجى التحقق من اتصالك.",
      hi: "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।",
      ko: "네트워크 오류입니다. 연결을 확인하세요.",
    },
  },
};

// In-memory storage for user language preferences
const userPreferences = new Map<number, UserLanguagePreference>();

/**
 * Get supported languages list
 */
export async function getSupportedLanguages(): Promise<LanguageMetadata[]> {
  try {
    return Object.values(LANGUAGE_METADATA);
  } catch (error) {
    console.error("[Localization] Failed to get supported languages:", error);
    throw error;
  }
}

/**
 * Get language metadata
 */
export async function getLanguageMetadata(
  languageCode: SupportedLanguage
): Promise<LanguageMetadata> {
  try {
    const metadata = LANGUAGE_METADATA[languageCode];
    if (!metadata) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }
    return metadata;
  } catch (error) {
    console.error("[Localization] Failed to get language metadata:", error);
    throw error;
  }
}

/**
 * Translate a key to specified language
 */
export async function translate(
  key: string,
  language: SupportedLanguage,
  fallback: string = key
): Promise<string> {
  try {
    const translation = TRANSLATIONS[key];
    if (!translation) {
      console.warn(`[Localization] Translation key not found: ${key}`);
      return fallback;
    }

    return translation.translations[language] || translation.translations.en || fallback;
  } catch (error) {
    console.error("[Localization] Failed to translate:", error);
    return fallback;
  }
}

/**
 * Detect user's preferred language from device locale
 */
export async function detectLanguage(deviceLocale: string): Promise<SupportedLanguage> {
  try {
    // Extract language code from locale (e.g., "en-US" -> "en")
    const languageCode = deviceLocale.split("-")[0].toLowerCase() as SupportedLanguage;

    // Check if language is supported
    if (LANGUAGE_METADATA[languageCode]) {
      return languageCode;
    }

    // Fall back to English if language not supported
    return "en";
  } catch (error) {
    console.error("[Localization] Failed to detect language:", error);
    return "en";
  }
}

/**
 * Set user language preference
 */
export async function setUserLanguage(
  userId: number,
  language: SupportedLanguage,
  autoDetect: boolean = false
): Promise<UserLanguagePreference> {
  try {
    const preference: UserLanguagePreference = {
      userId,
      preferredLanguage: language,
      secondaryLanguages: [],
      autoDetect,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userPreferences.set(userId, preference);

    console.log(`[Localization] Set language preference for user ${userId}: ${language}`);

    return preference;
  } catch (error) {
    console.error("[Localization] Failed to set user language:", error);
    throw error;
  }
}

/**
 * Get user language preference
 */
export async function getUserLanguage(userId: number): Promise<SupportedLanguage> {
  try {
    const preference = userPreferences.get(userId);
    return preference?.preferredLanguage || "en";
  } catch (error) {
    console.error("[Localization] Failed to get user language:", error);
    return "en";
  }
}

/**
 * Format date according to language preferences
 */
export async function formatDate(
  date: Date,
  language: SupportedLanguage
): Promise<string> {
  try {
    const metadata = await getLanguageMetadata(language);
    const formatter = new Intl.DateTimeFormat(language, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch (error) {
    console.error("[Localization] Failed to format date:", error);
    return date.toLocaleDateString();
  }
}

/**
 * Format currency according to language preferences
 */
export async function formatCurrency(
  amount: number,
  language: SupportedLanguage
): Promise<string> {
  try {
    const metadata = await getLanguageMetadata(language);
    const formatter = new Intl.NumberFormat(language, {
      style: "currency",
      currency: "USD",
    });
    return formatter.format(amount);
  } catch (error) {
    console.error("[Localization] Failed to format currency:", error);
    return `${amount}`;
  }
}

/**
 * Format number according to language preferences
 */
export async function formatNumber(
  number: number,
  language: SupportedLanguage
): Promise<string> {
  try {
    const formatter = new Intl.NumberFormat(language);
    return formatter.format(number);
  } catch (error) {
    console.error("[Localization] Failed to format number:", error);
    return `${number}`;
  }
}

/**
 * Get all translations for a language
 */
export async function getTranslations(
  language: SupportedLanguage
): Promise<Record<string, string>> {
  try {
    const translations: Record<string, string> = {};

    for (const [key, translationKey] of Object.entries(TRANSLATIONS)) {
      translations[key] = translationKey.translations[language] || translationKey.translations.en;
    }

    return translations;
  } catch (error) {
    console.error("[Localization] Failed to get translations:", error);
    throw error;
  }
}

/**
 * Check if language uses RTL (right-to-left) direction
 */
export async function isRTLLanguage(language: SupportedLanguage): Promise<boolean> {
  try {
    const metadata = await getLanguageMetadata(language);
    return metadata.direction === "rtl";
  } catch (error) {
    console.error("[Localization] Failed to check RTL:", error);
    return false;
  }
}
