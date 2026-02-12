import type { Page } from "./api";
import { authorizedFetch } from "./secured-fetch";

export type ApiResponse<T> = {
  status: number | string;
  message: string;
  data: T;
};

export type OrderItem = {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
};

export type OrderItemRequest = {
  productId: number;
  quantity: number;
};

export type OrderRequest = {
  userId: number;
  items: OrderItemRequest[];
};

export type UpdateOrderRequest = {
  status: string;
};

export type GetUserOrdersResponse = ApiResponse<Order[]>;
export type GetOrderByIdResponse = ApiResponse<Order>;
export type GetAllOrdersResponse = ApiResponse<Page<Order>>;
export type UpdateOrderStatusResponse = ApiResponse<Order>;
export type CreateOrderResponse = ApiResponse<Order>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_BASE_URL is not set. API calls will fail at runtime.");
}

async function handleOrderResponse<T>(res: Response): Promise<T> {
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

export async function createOrder(request: OrderRequest): Promise<CreateOrderResponse> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return handleOrderResponse<CreateOrderResponse>(res as Response);
}

export async function getOrderById(orderId: number): Promise<GetOrderByIdResponse> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleOrderResponse<GetOrderByIdResponse>(res as Response);
}

export async function getUserOrders(userId: number): Promise<GetUserOrdersResponse> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/orders/user/${userId}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleOrderResponse<GetUserOrdersResponse>(res as Response);
}

export async function getAllOrders(page = 0, size = 10): Promise<GetAllOrdersResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  const res = await authorizedFetch(
    `${API_BASE_URL}/api/v1/orders?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return handleOrderResponse<GetAllOrdersResponse>(res as Response);
}

export async function updateOrderStatus(
  orderId: number,
  request: UpdateOrderRequest
): Promise<UpdateOrderStatusResponse> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return handleOrderResponse<UpdateOrderStatusResponse>(res as Response);
}

export async function deleteOrder(orderId: number): Promise<void> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
    method: "DELETE",
  });

  if (!(res as Response).ok && (res as Response).status !== 204) {
    let body: unknown = null;
    try {
      body = await (res as Response).json();
    } catch {
      // ignore
    }
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (body as any).message
        : `Failed to delete order (status ${res.status})`;
    const error = new Error(message) as Error & { status?: number; body?: unknown };
    error.status = res.status;
    error.body = body;
    throw error;
  }
}
