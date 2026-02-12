export type ResponseDto<T> = {
  status: number;
  message: string;
  data: T;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
};

export type PageSort = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
};

export type PagePageable = {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: PageSort;
};

export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  sort: PageSort;
  pageable: PagePageable;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_BASE_URL is not set. API calls will fail at runtime.");
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await res.json();
    } catch {
      // ignore
    }

    const error = new Error(
      typeof errorBody === "object" && errorBody !== null && "message" in errorBody
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (errorBody as any).message
        : `Request failed with status ${res.status}`
    ) as Error & { status?: number; body?: unknown };

    error.status = res.status;
    error.body = errorBody;
    throw error;
  }

  return (await res.json()) as T;
}

export async function listProducts(options?: {
  page?: number;
  size?: number;
  sort?: string;
  categoryId?: number;
}): Promise<ResponseDto<Page<Product>>> {
  const params = new URLSearchParams();
  if (typeof options?.page === "number") params.set("page", String(options.page));
  if (typeof options?.size === "number") params.set("size", String(options.size));
  if (options?.sort) params.set("sort", options.sort);
  if(typeof options?.categoryId === "number") params.set("categoryId", String(options.categoryId));

  const url = `${API_BASE_URL}/api/v1/products${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    // Favor ISR / SSR caching for storefront lists; tune as needed.
    next: { revalidate: 60 },
  });

  return handleResponse<ResponseDto<Page<Product>>>(res);
}

export async function getProductById(id: number): Promise<ResponseDto<Product>> {
  const url = `${API_BASE_URL}/api/v1/products/${id}`;
  const res = await fetch(url, {
    method: "GET",
    next: { revalidate: 300 },
  });

  return handleResponse<ResponseDto<Product>>(res);
}

export async function listProductsByCategory(options: {
  categoryId: number;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<ResponseDto<Page<Product>>> {
  const params = new URLSearchParams();
  if (typeof options.page === "number") params.set("page", String(options.page));
  if (typeof options.size === "number") params.set("size", String(options.size));
  if (options.sort) params.set("sort", options.sort);

  const url = `${API_BASE_URL}/api/v1/products/category/${options.categoryId}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const res = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 },
  });

  return handleResponse<ResponseDto<Page<Product>>>(res);
}

export type ProductRequest = {
  name: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
};

import { authorizedFetch } from "./secured-fetch";

export async function createProduct(body: ProductRequest): Promise<ResponseDto<Product>> {
  const url = `${API_BASE_URL}/api/v1/products`;
  const res = await authorizedFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<ResponseDto<Product>>(res as Response);
}

export async function updateProduct(id: number, body: ProductRequest): Promise<ResponseDto<Product>> {
  const url = `${API_BASE_URL}/api/v1/products/${id}`;
  const res = await authorizedFetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<ResponseDto<Product>>(res as Response);
}

export async function deleteProduct(id: number): Promise<void> {
  const url = `${API_BASE_URL}/api/v1/products/${id}`;
  const res = await authorizedFetch(url, {
    method: "DELETE",
  });

  if (!(res as Response).ok) {
    await handleResponse(res as Response);
  }
}
