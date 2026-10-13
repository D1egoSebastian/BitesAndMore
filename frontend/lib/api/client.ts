import { ApiError } from "./errors";
import type {
  BusinessInfo,
  BusinessInfoInput,
  Category,
  CategoryInput,
  Product,
  ProductInput,
  Service,
  ServiceImage,
  ServiceImageInput,
  ServiceInput,
} from "./types";

export interface ApiClientOptions {
  /** API origin, e.g. http://localhost:5047 (no /api suffix). */
  baseUrl: string;
  /** JWT for admin writes. Never available in the browser. */
  token?: string;
  /** Extra options for GET requests, e.g. `{ next: { revalidate: 60 } }` or `{ cache: "no-store" }`. */
  readInit?: RequestInit;
  fetchImpl?: typeof fetch;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function readApiMessage(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
      return body.message;
    }
  } catch {
    // Body was empty or not JSON.
  }
  return null;
}

async function nullOnNotFound<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) return null;
    throw error;
  }
}

export function createApiClient({ baseUrl, token, readInit, fetchImpl = fetch }: ApiClientOptions) {
  const origin = baseUrl.replace(/\/+$/, "");

  async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let payload: BodyInit | undefined;
    if (body instanceof FormData) {
      payload = body;
    } else if (body !== undefined) {
      headers.set("Content-Type", "application/json");
      payload = JSON.stringify(body);
    }

    const init: RequestInit =
      method === "GET"
        ? { ...readInit, method, headers }
        : { method, headers, body: payload, cache: "no-store" };

    let response: Response;
    try {
      response = await fetchImpl(`${origin}${path}`, init);
    } catch {
      throw new ApiError(0, null);
    }

    if (!response.ok) {
      throw new ApiError(response.status, await readApiMessage(response));
    }

    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  return {
    // Public reads
    getBusinessInfo: () => nullOnNotFound(request<BusinessInfo>("GET", "/api/businessinfo")),
    getCategories: () => request<Category[]>("GET", "/api/category"),
    getProducts: (categoryId?: number) =>
      request<Product[]>(
        "GET",
        categoryId === undefined ? "/api/product" : `/api/product?categoryId=${encodeURIComponent(categoryId)}`,
      ),
    getProductBySlug: (slug: string) =>
      nullOnNotFound(request<Product>("GET", `/api/product/slug/${encodeURIComponent(slug)}`)),
    getProductById: (id: number) => nullOnNotFound(request<Product>("GET", `/api/product/${id}`)),
    getServices: () => request<Service[]>("GET", "/api/service"),
    getServiceById: (id: number) => nullOnNotFound(request<Service>("GET", `/api/service/${id}`)),

    // Auth
    login: async (email: string, password: string) =>
      (await request<{ token: string }>("POST", "/api/auth/login", { email, password })).token,
    changePassword: (currentPassword: string, newPassword: string) =>
      request<void>("POST", "/api/auth/change-password", { currentPassword, newPassword }),

    // Admin writes
    createProduct: (input: ProductInput) => request<Product>("POST", "/api/product", input),
    updateProduct: (id: number, input: ProductInput) => request<Product>("PUT", `/api/product/${id}`, input),
    deleteProduct: (id: number) => request<void>("DELETE", `/api/product/${id}`),

    createCategory: (input: CategoryInput) => request<Category>("POST", "/api/category", input),
    updateCategory: (id: number, input: CategoryInput) => request<Category>("PUT", `/api/category/${id}`, input),
    deleteCategory: (id: number) => request<void>("DELETE", `/api/category/${id}`),

    createService: (input: ServiceInput) => request<Service>("POST", "/api/service", input),
    updateService: (id: number, input: ServiceInput) => request<Service>("PUT", `/api/service/${id}`, input),
    deleteService: (id: number) => request<void>("DELETE", `/api/service/${id}`),

    addServiceImage: (serviceId: number, input: ServiceImageInput) =>
      request<ServiceImage>("POST", `/api/service/${serviceId}/images`, input),
    updateServiceImageCaption: (serviceId: number, imageId: number, caption: string | null) =>
      request<ServiceImage>("PATCH", `/api/service/${serviceId}/images/${imageId}`, { caption }),
    deleteServiceImage: (serviceId: number, imageId: number) =>
      request<void>("DELETE", `/api/service/${serviceId}/images/${imageId}`),
    /** imageIds must list every photo of the service exactly once, in the new order. */
    reorderServiceImages: (serviceId: number, imageIds: number[]) =>
      request<void>("PUT", `/api/service/${serviceId}/images/order`, { imageIds }),

    updateBusinessInfo: (input: BusinessInfoInput) => request<BusinessInfo>("PUT", "/api/businessinfo", input),

    uploadImage: async (file: Blob, filename: string) => {
      const form = new FormData();
      form.append("file", file, filename);
      return (await request<{ url: string }>("POST", "/api/upload", form)).url;
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
