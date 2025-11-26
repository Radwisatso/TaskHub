import { AuthResponse, LoginRequest, RegisterRequest, Task } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth APIs
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Task APIs
export const taskAPI = {
  getTasks: async (): Promise<Task[]> => {
    return fetchWithAuth("/tasks");
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    return fetchWithAuth("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    return fetchWithAuth(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteTask: async (id: string): Promise<void> => {
    await fetchWithAuth(`/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
