import type { ResponseDto } from "./api";
import { authorizedFetch } from "./secured-fetch";

export type UserRole = "admin" | "customer" | "seller" | string;

export type User = {
  id: number;
  username: string;
  email: string;
  userRole: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type UserLoginRequest = {
  email: string;
  password: string;
};

export type UserRequest = {
  username: string;
  email: string;
  password: string;
  userRole: UserRole;
};

export type UpdateUserRequest = Partial<UserRequest>;

export type Page<T> = import("./api").Page<T>;

export type GetUsersResponse = ResponseDto<Page<User>>;
export type GetUserByIdResponse = ResponseDto<User>;
export type CreateUserResponse = ResponseDto<null>;
export type UpdateUserResponse = ResponseDto<User>;
export type LoginUserResponse = ResponseDto<User>;
export type RegisterUserResponse = CreateUserResponse;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function handleUserResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (body as any).message
        : `Request failed with status ${res.status}`;
    const error = new Error(message) as Error & { status?: number; body?: unknown };
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return (await res.json()) as T;
}

export async function getUsers(params: {
  page: number;
  size: number;
}): Promise<GetUsersResponse> {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("size", String(params.size));

  const res = await authorizedFetch(
    `${API_BASE_URL}/api/v1/users?${search.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return handleUserResponse<GetUsersResponse>(res as Response);
}

export async function getUserById(id: number): Promise<GetUserByIdResponse> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/users/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleUserResponse<GetUserByIdResponse>(res as Response);
}

export async function createUser(request: UserRequest): Promise<CreateUserResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return handleUserResponse<CreateUserResponse>(res);
}

export async function updateUser(
  id: number,
  request: UpdateUserRequest
): Promise<UpdateUserResponse> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return handleUserResponse<UpdateUserResponse>(res as Response);
}

export async function deleteUser(id: number): Promise<void> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/users/${id}`, {
    method: "DELETE",
  });

  if ((res as Response).status !== 204) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (body as any).message
        : `Failed to delete user (status ${res.status})`;
    const error = new Error(message) as Error & { status?: number; body?: unknown };
    error.status = res.status;
    error.body = body;
    throw error;
  }
}

export async function loginUser(
  request: UserLoginRequest
): Promise<LoginUserResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    // try to read backend error, but fall back to generic
    let message = "Failed to login";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {}
    throw new Error(message);
  }

  const data = (await res.json()) as ApiResponse<LoginResponse>;
  return data;
}

export async function registerUser(
  request: UserRequest
): Promise<RegisterUserResponse> {
  return createUser(request);
}

export async function resetPasswordWithUserId(userId: string, password: string): Promise<void> {
  const res = await authorizedFetch(
    `${API_BASE_URL}/api/v1/users/${userId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }
  );

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (body as any).message
        : `Failed to reset password (status ${res.status})`;
    const error = new Error(message) as Error & { status?: number; body?: unknown };
    error.status = res.status;
    error.body = body;
    throw error;
  }
}
