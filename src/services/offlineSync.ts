import type {
  Announcement,
  FAQItem,
  GovernmentScheme,
  LearningTopic,
  UserFinancialStore,
  UserProfile,
} from '../types/finance';

const PUBLIC_CACHE_KEY = 'sfl_public_content_cache_v1';
const AUTH_CACHE_PREFIX = 'sfl_user_cache_v1_';
const PENDING_SYNC_PREFIX = 'sfl_pending_sync_v1_';
const SESSION_TOKEN_KEY = 'sfl_session_token_v1';
const SESSION_PROFILE_KEY = 'sfl_session_profile_v1';
const LANG_KEY = 'sfl_lang_v1';
const THEME_KEY = 'sfl_theme_v1';
const RECENT_SEARCH_KEY = 'sfl_recent_searches_v1';

export interface PublicContentBundle {
  schemes: GovernmentScheme[];
  learningTopics: LearningTopic[];
  faqs: FAQItem[];
  announcements: Announcement[];
  cachedAt: string;
}

export function savePublicContentCache(bundle: PublicContentBundle): void {
  try {
    localStorage.setItem(PUBLIC_CACHE_KEY, JSON.stringify(bundle));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadPublicContentCache(): PublicContentBundle | null {
  try {
    const raw = localStorage.getItem(PUBLIC_CACHE_KEY);
    return raw ? (JSON.parse(raw) as PublicContentBundle) : null;
  } catch {
    return null;
  }
}

export function saveUserOfflineCache(userId: string, store: UserFinancialStore, pendingSync: boolean): void {
  try {
    localStorage.setItem(`${AUTH_CACHE_PREFIX}${userId}`, JSON.stringify(store));
    if (pendingSync) {
      localStorage.setItem(`${PENDING_SYNC_PREFIX}${userId}`, 'true');
    } else {
      localStorage.removeItem(`${PENDING_SYNC_PREFIX}${userId}`);
    }
  } catch {
    // Ignore
  }
}

export function loadUserOfflineCache(userId: string): { store: UserFinancialStore | null; pendingSync: boolean } {
  try {
    const raw = localStorage.getItem(`${AUTH_CACHE_PREFIX}${userId}`);
    const pendingSync = localStorage.getItem(`${PENDING_SYNC_PREFIX}${userId}`) === 'true';
    return {
      store: raw ? (JSON.parse(raw) as UserFinancialStore) : null,
      pendingSync,
    };
  } catch {
    return { store: null, pendingSync: false };
  }
}

export function saveSessionAuth(token: string | null, profile: UserProfile | null): void {
  try {
    if (token && profile) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(SESSION_PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_PROFILE_KEY);
    }
  } catch {
    // Ignore
  }
}

export function loadSessionAuth(): { token: string | null; profile: UserProfile | null } {
  try {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const rawProfile = localStorage.getItem(SESSION_PROFILE_KEY);
    return {
      token,
      profile: rawProfile ? (JSON.parse(rawProfile) as UserProfile) : null,
    };
  } catch {
    return { token: null, profile: null };
  }
}

export function getSavedLanguage(): string {
  try {
    return localStorage.getItem(LANG_KEY) || 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguagePref(lang: string): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Ignore
  }
}

export function getSavedTheme(): 'light' | 'dark' {
  try {
    const val = localStorage.getItem(THEME_KEY);
    return val === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePref(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore
  }
}

export function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): string[] {
  const clean = query.trim();
  if (!clean) return loadRecentSearches();
  const next = [clean, ...loadRecentSearches().filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
  try {
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}
