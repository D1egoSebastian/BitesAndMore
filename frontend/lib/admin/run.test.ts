import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("../session/server", () => ({}));
vi.mock("../api/server", () => ({}));

const { refreshPublicSite } = await import("./run");

describe("refreshPublicSite", () => {
  beforeEach(() => revalidatePath.mockClear());

  it("invalidates the root layout, which covers every public page including each product page", () => {
    refreshPublicSite();

    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
