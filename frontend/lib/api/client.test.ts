import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "./client";
import { ApiError } from "./errors";

type FetchCall = { url: string; init: RequestInit };

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
  });
}

function mockFetch(...responses: Response[]) {
  const calls: FetchCall[] = [];
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    const next = responses.shift();
    if (!next) throw new Error("No mocked response left");
    return next;
  });
  return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}

const product = {
  id: 1,
  name: "Pastel de chocolate",
  slug: "pastel-de-chocolate",
  description: null,
  price: "RD$1,800",
  imageUrl: null,
  categoryId: 2,
  category: { id: 2, name: "Pasteles", description: null },
  isAvailable: true,
  createdDate: "2026-10-01T10:00:00Z",
  whatsAppUrl: null,
};

describe("createApiClient: request basics", () => {
  it("joins the base URL and the path without duplicating slashes", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(200, []));
    const api = createApiClient({ baseUrl: "http://localhost:5047/", fetchImpl });

    await api.getCategories();

    expect(calls[0].url).toBe("http://localhost:5047/api/category");
  });

  it("adds categoryId to the product query only when provided", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(200, []), jsonResponse(200, []));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    await api.getProducts();
    await api.getProducts(7);

    expect(calls[0].url).toBe("http://api.test/api/product");
    expect(calls[1].url).toBe("http://api.test/api/product?categoryId=7");
  });

  it("merges the configured read options (e.g. revalidation) into GET requests", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(200, []));
    const api = createApiClient({
      baseUrl: "http://api.test",
      fetchImpl,
      readInit: { next: { revalidate: 60 } } as RequestInit,
    });

    await api.getServices();

    expect((calls[0].init as { next?: unknown }).next).toEqual({ revalidate: 60 });
  });

  it("sends the bearer token only when the client has one", async () => {
    const anonymous = mockFetch(jsonResponse(200, []));
    await createApiClient({ baseUrl: "http://api.test", fetchImpl: anonymous.fetchImpl }).getCategories();
    expect(new Headers(anonymous.calls[0].init.headers).has("Authorization")).toBe(false);

    const authed = mockFetch(jsonResponse(204));
    await createApiClient({ baseUrl: "http://api.test", fetchImpl: authed.fetchImpl, token: "abc" }).deleteProduct(3);
    expect(new Headers(authed.calls[0].init.headers).get("Authorization")).toBe("Bearer abc");
    expect(authed.calls[0].init.method).toBe("DELETE");
    expect(authed.calls[0].url).toBe("http://api.test/api/product/3");
  });

  it("serializes JSON bodies with the JSON content type", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(201, product));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl, token: "t" });

    await api.createProduct({
      name: "Pastel de chocolate",
      description: null,
      price: "RD$1,800",
      imageUrl: null,
      categoryId: 2,
      isAvailable: true,
    });

    expect(calls[0].init.method).toBe("POST");
    expect(new Headers(calls[0].init.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({ name: "Pastel de chocolate", categoryId: 2 });
  });

  it("uploads images as multipart form data with the field name 'file'", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(200, { url: "https://res.cloudinary.com/x/y.jpg" }));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl, token: "t" });

    const url = await api.uploadImage(new Blob(["img"], { type: "image/jpeg" }), "cake.jpg");

    expect(url).toBe("https://res.cloudinary.com/x/y.jpg");
    expect(calls[0].url).toBe("http://api.test/api/upload");
    const body = calls[0].init.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("file")).toBeInstanceOf(Blob);
    // The browser/runtime must set the multipart boundary itself.
    expect(new Headers(calls[0].init.headers).has("Content-Type")).toBe(false);
  });

  it("returns the token on a successful login", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(200, { token: "jwt" }));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    await expect(api.login("admin", "secret")).resolves.toBe("jwt");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ email: "admin", password: "secret" });
  });

  it("resolves to undefined on 204 No Content", async () => {
    const { fetchImpl } = mockFetch(jsonResponse(204));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl, token: "t" });

    await expect(api.changePassword("old-password", "new-password")).resolves.toBeUndefined();
  });
});

describe("createApiClient: error mapping", () => {
  it("maps 401 to an ApiError flagged as unauthorized", async () => {
    const { fetchImpl } = mockFetch(jsonResponse(401));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl, token: "expired" });

    const error = await api.deleteService(1).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).isUnauthorized).toBe(true);
  });

  it("maps 400 to an ApiError carrying the API message", async () => {
    const { fetchImpl } = mockFetch(jsonResponse(400, { message: "that product already exist!" }));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl, token: "t" });

    const error = (await api
      .createCategory({ name: "Pasteles", description: null })
      .catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.apiMessage).toBe("that product already exist!");
  });

  it("keeps apiMessage null when an error body is not JSON", async () => {
    const { fetchImpl } = mockFetch(new Response("boom", { status: 500 }));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    const error = (await api.getCategories().catch((e: unknown) => e)) as ApiError;

    expect(error.status).toBe(500);
    expect(error.apiMessage).toBeNull();
  });

  it("maps 404 to an ApiError for generic resources", async () => {
    const { fetchImpl } = mockFetch(jsonResponse(404, { message: "product not found" }));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl, token: "t" });

    const error = (await api.deleteProduct(99).catch((e: unknown) => e)) as ApiError;

    expect(error.status).toBe(404);
    expect(error.isNotFound).toBe(true);
  });

  it("returns null when business info is not configured (404)", async () => {
    const { fetchImpl } = mockFetch(jsonResponse(404, { message: "business info is not configured yet!" }));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    await expect(api.getBusinessInfo()).resolves.toBeNull();
  });

  it("returns null when a slug does not exist (404)", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(404, { message: "product not found" }));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    await expect(api.getProductBySlug("no existe")).resolves.toBeNull();
    expect(calls[0].url).toBe("http://api.test/api/product/slug/no%20existe");
  });

  it("returns the product when the slug exists", async () => {
    const { fetchImpl } = mockFetch(jsonResponse(200, product));
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    await expect(api.getProductBySlug("pastel-de-chocolate")).resolves.toEqual(product);
  });

  it("maps network failures to an ApiError with status 0", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    const api = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    const error = (await api.getServices().catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.isNetworkError).toBe(true);
  });
});

describe("createApiClient: service gallery", () => {
  const image = { id: 5, url: "https://img.test/a.jpg", caption: "Mesa", sortOrder: 1 };

  it("adds a photo with POST /api/service/{id}/images", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(201, image));
    const api = createApiClient({ baseUrl: "http://api.test", token: "jwt", fetchImpl });

    const created = await api.addServiceImage(3, { url: "https://img.test/a.jpg", caption: "Mesa" });

    expect(created).toEqual(image);
    expect(calls[0].url).toBe("http://api.test/api/service/3/images");
    expect(calls[0].init.method).toBe("POST");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ url: "https://img.test/a.jpg", caption: "Mesa" });
  });

  it("changes a caption with PATCH and a JSON body", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(200, { ...image, caption: null }));
    const api = createApiClient({ baseUrl: "http://api.test", token: "jwt", fetchImpl });

    await api.updateServiceImageCaption(3, 5, null);

    expect(calls[0].url).toBe("http://api.test/api/service/3/images/5");
    expect(calls[0].init.method).toBe("PATCH");
    expect(new Headers(calls[0].init.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ caption: null });
  });

  it("deletes a photo and reorders the gallery", async () => {
    const { fetchImpl, calls } = mockFetch(jsonResponse(204), jsonResponse(204));
    const api = createApiClient({ baseUrl: "http://api.test", token: "jwt", fetchImpl });

    await api.deleteServiceImage(3, 5);
    await api.reorderServiceImages(3, [7, 5, 6]);

    expect(calls[0].url).toBe("http://api.test/api/service/3/images/5");
    expect(calls[0].init.method).toBe("DELETE");
    expect(calls[1].url).toBe("http://api.test/api/service/3/images/order");
    expect(calls[1].init.method).toBe("PUT");
    expect(JSON.parse(String(calls[1].init.body))).toEqual({ imageIds: [7, 5, 6] });
  });
});
