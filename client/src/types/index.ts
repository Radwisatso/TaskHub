export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: "To Do" | "In Progress" | "Done";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
