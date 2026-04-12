"use client";

import { adminFetch } from "./api";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export async function login(username: string, password: string): Promise<AdminUser> {
  return adminFetch<AdminUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<void> {
  await adminFetch("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<AdminUser> {
  return adminFetch<AdminUser>("/auth/me");
}
