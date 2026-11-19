import type {
  Announcement,
  FAQItem,
  GovernmentScheme,
  LearningTopic,
  UserFinancialStore,
  UserProfile,
} from '../types/finance';

async function requestJson<T>(url: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const apiClient = {
  register(payload: {
    fullName: string;
    email: string;
    password: string;
    preferredLanguage: string;
    monthlyIncomeRange?: string;
    financialGoalsSummary?: string;
    adminInviteCode?: string;
  }) {
    return requestJson<{ token: string; profile: UserProfile; store: UserFinancialStore }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: { email: string; password: string }) {
    return requestJson<{ token: string; profile: UserProfile; store: UserFinancialStore }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  forgotPassword(email: string) {
    return requestJson<{ message: string; verificationCode: string; deliveryNote: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(payload: { email: string; code: string; newPassword: string }) {
    return requestJson<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe(token: string) {
    return requestJson<{ profile: UserProfile; store: UserFinancialStore }>('/api/auth/me', {}, token);
  },

  updateProfile(token: string, updates: Partial<UserProfile>) {
    return requestJson<{ profile: UserProfile }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, token);
  },

  changePassword(token: string, payload: { currentPassword: string; newPassword: string }) {
    return requestJson<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token);
  },

  deleteAccount(token: string) {
    return requestJson<{ message: string }>('/api/auth/account', {
      method: 'DELETE',
    }, token);
  },

  saveFinanceState(token: string, store: UserFinancialStore) {
    return requestJson<{ store: UserFinancialStore; syncedAt: string }>('/api/finance/state', {
      method: 'PUT',
      body: JSON.stringify(store),
    }, token);
  },

  getPublicContent() {
    return requestJson<{
      schemes: GovernmentScheme[];
      learningTopics: LearningTopic[];
      faqs: FAQItem[];
      announcements: Announcement[];
    }>('/api/public/content');
  },

  askAiAssistant(payload: {
    message: string;
    history: { role: 'user' | 'assistant'; content: string }[];
    language: string;
    financialContext?: unknown;
    speedMode?: 'general' | 'fast';
    persona?: 'coach' | 'schemes' | 'tutor';
  }) {
    return requestJson<{ reply: string; modelUsed?: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  transcribeAudio(payload: {
    audioBase64: string;
    mimeType: string;
    language?: string;
  }) {
    return requestJson<{ transcript: string }>('/api/ai/transcribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  adminGetAnalytics(token: string) {
    return requestJson<{
      totalUsers: number;
      totalTransactions: number;
      totalGoals: number;
      schemesCount: number;
      topicsCount: number;
      faqsCount: number;
      announcementsCount: number;
    }>('/api/admin/analytics', {}, token);
  },

  adminCreateScheme(token: string, scheme: Omit<GovernmentScheme, 'id'>) {
    return requestJson<{ scheme: GovernmentScheme }>('/api/admin/schemes', {
      method: 'POST',
      body: JSON.stringify(scheme),
    }, token);
  },

  adminUpdateScheme(token: string, id: string, updates: Partial<GovernmentScheme>) {
    return requestJson<{ scheme: GovernmentScheme }>(`/api/admin/schemes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, token);
  },

  adminDeleteScheme(token: string, id: string) {
    return requestJson<{ ok: boolean }>(`/api/admin/schemes/${id}`, {
      method: 'DELETE',
    }, token);
  },

  adminCreateLearningTopic(token: string, topic: Omit<LearningTopic, 'id'>) {
    return requestJson<{ topic: LearningTopic }>('/api/admin/learning', {
      method: 'POST',
      body: JSON.stringify(topic),
    }, token);
  },

  adminDeleteLearningTopic(token: string, id: string) {
    return requestJson<{ ok: boolean }>(`/api/admin/learning/${id}`, {
      method: 'DELETE',
    }, token);
  },

  adminCreateFaq(token: string, faq: Omit<FAQItem, 'id'>) {
    return requestJson<{ faq: FAQItem }>('/api/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(faq),
    }, token);
  },

  adminDeleteFaq(token: string, id: string) {
    return requestJson<{ ok: boolean }>(`/api/admin/faqs/${id}`, {
      method: 'DELETE',
    }, token);
  },

  adminCreateAnnouncement(token: string, ann: Omit<Announcement, 'id'>) {
    return requestJson<{ announcement: Announcement }>('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(ann),
    }, token);
  },

  adminDeleteAnnouncement(token: string, id: string) {
    return requestJson<{ ok: boolean }>(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    }, token);
  },
};
