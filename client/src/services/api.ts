import {
  User,
  Scholarship,
  ApplicationItem,
  SavedScholarshipItem,
  EligibilityAssessment,
  ChatMessage,
  ApplicationStatus,
} from '../types/index.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getToken = (): string | null => {
  return localStorage.getItem('scholar_track_token');
};

const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('scholar_track_token', token);
  } else {
    localStorage.removeItem('scholar_track_token');
  }
};

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors && data.errors[0]?.message) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// ----------------------------------------------------------------------
// Auth Endpoints
// ----------------------------------------------------------------------
export const authApi = {
  async register(body: any): Promise<{ token: string; user: User; message: string }> {
    const res = await apiFetch<{ token: string; user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setToken(res.token);
    return res;
  },

  async login(body: any): Promise<{ token: string; user: User; message: string }> {
    const res = await apiFetch<{ token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setToken(null);
    }
  },

  async getMe(): Promise<{ user: User }> {
    return apiFetch<{ user: User }>('/auth/me');
  },
};

// ----------------------------------------------------------------------
// Scholarship Endpoints
// ----------------------------------------------------------------------
export const scholarshipApi = {
  async getAll(params?: Record<string, any>): Promise<{
    data: Scholarship[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/scholarships${qs}`);
  },

  async getById(id: string): Promise<{ data: Scholarship; related: Scholarship[] }> {
    return apiFetch(`/scholarships/${id}`);
  },

  async getFilterMeta(): Promise<{
    filters: {
      categories: string[];
      educationLevels: string[];
      states: string[];
    };
  }> {
    return apiFetch('/scholarships/meta/filters');
  },
};

// ----------------------------------------------------------------------
// Eligibility Endpoints
// ----------------------------------------------------------------------
export const eligibilityApi = {
  async check(input: any): Promise<{
    summary: {
      totalEvaluated: number;
      eligibleCount: number;
      partiallyEligibleCount: number;
      ineligibleCount: number;
    };
    results: {
      eligible: EligibilityAssessment[];
      partiallyEligible: EligibilityAssessment[];
      ineligible: EligibilityAssessment[];
    };
    disclaimer: string;
  }> {
    return apiFetch('/eligibility/check', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

// ----------------------------------------------------------------------
// Saved Scholarships
// ----------------------------------------------------------------------
export const savedScholarshipApi = {
  async getAll(): Promise<{ data: SavedScholarshipItem[] }> {
    return apiFetch('/saved-scholarships');
  },

  async save(scholarshipId: string): Promise<{ message: string; data: SavedScholarshipItem }> {
    return apiFetch('/saved-scholarships', {
      method: 'POST',
      body: JSON.stringify({ scholarshipId }),
    });
  },

  async remove(id: string): Promise<{ message: string }> {
    return apiFetch(`/saved-scholarships/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------------------------
// Application Tracker
// ----------------------------------------------------------------------
export const applicationApi = {
  async getAll(): Promise<{
    data: ApplicationItem[];
    summary: {
      total: number;
      statusCounts: Record<string, number>;
      totalPotentialValue: number;
    };
  }> {
    return apiFetch('/applications');
  },

  async create(body: {
    scholarshipId: string;
    status?: ApplicationStatus;
    notes?: string;
    targetDeadline?: string;
  }): Promise<{ message: string; data: ApplicationItem }> {
    return apiFetch('/applications', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async update(
    id: string,
    body: {
      status?: ApplicationStatus;
      notes?: string;
      targetDeadline?: string;
      appliedDate?: string;
      documentsSubmitted?: string[];
    }
  ): Promise<{ message: string; data: ApplicationItem }> {
    return apiFetch(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiFetch(`/applications/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------------------------
// Profile Endpoints
// ----------------------------------------------------------------------
export const profileApi = {
  async get(): Promise<{ profile: User }> {
    return apiFetch('/profile');
  },

  async update(data: Partial<User>): Promise<{ message: string; profile: User }> {
    return apiFetch('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ----------------------------------------------------------------------
// AI & ScholarBot Endpoints
// ----------------------------------------------------------------------
export const aiApi = {
  async chat(body: {
    message: string;
    history?: { role: 'user' | 'assistant' | 'system'; content: string }[];
    profile?: any;
  }): Promise<{
    reply: string;
    providerUsed: string;
    suggestedQuestions: string[];
    groundedScholarships?: any[];
    disclaimer: string;
  }> {
    return apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async getRecommendations(profile?: any): Promise<{
    data: EligibilityAssessment[];
    count: number;
    disclaimer: string;
  }> {
    return apiFetch('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(profile || {}),
    });
  },

  async getApplicationGuidance(body: {
    type: 'sop' | 'checklist' | 'email' | 'mistakes';
    scholarshipTitle?: string;
    studentDetails?: any;
  }): Promise<{ content: string; type: string; disclaimer: string }> {
    return apiFetch('/ai/application-guidance', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

// ----------------------------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------------------------
export const healthApi = {
  async check(): Promise<any> {
    return apiFetch('/health');
  },
};
