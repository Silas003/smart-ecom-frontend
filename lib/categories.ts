import type { ResponseDto } from "./api";
import { authorizedFetch } from "./secured-fetch";

export type Category = {
  id: number;
  name: string;
};

export type CategoryRequest = {
  name: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function handleCategoryResponse<T>(res: Response): Promise<T> {
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

export async function getAllCategories(): Promise<ResponseDto<Category[]>> {
  const res = await fetch(`${API_BASE_URL}/api/v1/categories`, {
    method: "GET",
    cache: "no-store",
  });

  return handleCategoryResponse<ResponseDto<Category[]>>(res);
}

export async function getCategoryById(id: number): Promise<ResponseDto<Category>> {
  const res = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleCategoryResponse<ResponseDto<Category>>(res);
}

export async function createCategory(
  body: CategoryRequest
): Promise<ResponseDto<Category>> {
  const res = await authorizedFetch(
    `${API_BASE_URL}/api/v1/categories/create_category`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return handleCategoryResponse<ResponseDto<Category>>(res as Response);
}

export async function updateCategory(
  id: number,
  body: CategoryRequest
): Promise<ResponseDto<Category>> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleCategoryResponse<ResponseDto<Category>>(res as Response);
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: "DELETE",
  });

  if (!(res as Response).ok && (res as Response).status !== 204) {
    await handleCategoryResponse(res as Response);
  }
}
