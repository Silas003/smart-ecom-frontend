import type { ResponseDto } from "./api";
import { authorizedFetch } from "./secured-fetch";

export type CartStatus = "active" | "checkout" | "deactivated";

export type CartItem = {
  cartItemId: number;
  cartId: number;
  userId: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
};

export type CartSummary = {
  cartId: number;
  userId: number;
  status: CartStatus;
  totalQuantity: number;
  totalPrice: number;
  items: CartItem[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_BASE_URL is not set. API calls will fail at runtime.");
}

async function handleCartResponse<T>(res: Response): Promise<T> {
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

export async function addItemToCart(options: {
  userId: number;
  productId: number;
  quantity: number;
}): Promise<ResponseDto<CartItem>> {
  const res = await authorizedFetch(
    `${API_BASE_URL}/api/v1/carts/users/${options.userId}/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: options.productId,
        quantity: options.quantity,
      }),
    }
  );

  return handleCartResponse<ResponseDto<CartItem>>(res as Response);
}

export async function getCartForUser(
  userId: number
): Promise<ResponseDto<CartSummary>> {
  const res = await authorizedFetch(`${API_BASE_URL}/api/v1/carts/users/${userId}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleCartResponse<ResponseDto<CartSummary>>(res as Response);
}

export async function removeItemFromCart(options: {
  userId: number;
  cartItemId: number;
}): Promise<ResponseDto<null>> {
  const res = await authorizedFetch(
    `${API_BASE_URL}/api/v1/carts/users/${options.userId}/items/${options.cartItemId}`,
    {
      method: "DELETE",
    }
  );

  if ((res as Response).status === 204) {
    return { status: 204, message: "Item removed from cart successfully", data: null };
  }

  return handleCartResponse<ResponseDto<null>>(res as Response);
}

export type UpdateCartStatusRequest = {
  status: CartStatus;
};

const ALLOWED_CART_STATUSES: CartStatus[] = ["active", "checkout", "deactivated"];

export async function updateCartStatus(options: {
  cartId: number;
  body: UpdateCartStatusRequest;
}): Promise<ResponseDto<CartSummary>> {
  if (!ALLOWED_CART_STATUSES.includes(options.body.status)) {
    throw new Error(`Invalid cart status: ${options.body.status}`);
  }

  const res = await authorizedFetch(
    `${API_BASE_URL}/api/v1/carts/${options.cartId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: options.body.status }),
    }
  );

  return handleCartResponse<ResponseDto<CartSummary>>(res as Response);
}
