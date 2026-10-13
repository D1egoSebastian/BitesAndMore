import { describe, expect, it } from "vitest";
import type { Service, ServiceImage } from "./api/types";
import {
  MAX_SERVICE_IMAGES,
  buildServiceWhatsAppUrl,
  galleryCountLabel,
  moveItem,
  orderServicesForPage,
  remainingGallerySlots,
  serviceShowcaseGroups,
  serviceSlides,
  sortServiceImages,
} from "./service-gallery";

function makeService(overrides: Partial<Service>): Service {
  return {
    id: 1,
    name: "Mesa de dulces",
    description: null,
    imageUrl: null,
    price: null,
    serviceType: "EventsPlanner",
    images: [],
    ...overrides,
  };
}

function image(id: number, url: string, sortOrder: number, caption: string | null = null): ServiceImage {
  return { id, url, caption, sortOrder };
}

describe("sortServiceImages", () => {
  it("orders by sortOrder, then by id", () => {
    const sorted = sortServiceImages([image(3, "c", 2), image(1, "a", 2), image(2, "b", 1)]);
    expect(sorted.map((i) => i.id)).toEqual([2, 1, 3]);
  });

  it("treats a missing list (API not yet updated) as empty", () => {
    expect(sortServiceImages(undefined)).toEqual([]);
    expect(sortServiceImages(null)).toEqual([]);
  });
});

describe("serviceSlides", () => {
  it("puts the cover first and then the gallery in order", () => {
    const service = makeService({
      imageUrl: "https://img/cover.jpg",
      images: [image(2, "https://img/b.jpg", 2, "Torre de macarons"), image(1, "https://img/a.jpg", 1)],
    });

    const slides = serviceSlides(service);

    expect(slides.map((s) => s.src)).toEqual(["https://img/cover.jpg", "https://img/a.jpg", "https://img/b.jpg"]);
    expect(slides.map((s) => s.caption)).toEqual([null, null, "Torre de macarons"]);
  });

  it("skips gallery photos that repeat an earlier url and keeps their caption on the first one", () => {
    const service = makeService({
      imageUrl: " https://img/cover.jpg ",
      images: [
        image(1, "https://img/cover.jpg", 1, "Mesa principal"),
        image(2, "https://img/a.jpg", 2),
        image(3, "https://img/a.jpg", 3, "Repetida"),
      ],
    });

    const slides = serviceSlides(service);

    expect(slides.map((s) => s.src)).toEqual(["https://img/cover.jpg", "https://img/a.jpg"]);
    expect(slides[0].caption).toBe("Mesa principal");
    expect(slides[1].caption).toBe("Repetida");
  });

  it("keeps the first caption when both copies of a url have one", () => {
    const slides = serviceSlides(
      makeService({ images: [image(1, "https://img/a.jpg", 1, "Primera"), image(2, "https://img/a.jpg", 2, "Segunda")] }),
    );

    expect(slides).toHaveLength(1);
    expect(slides[0].caption).toBe("Primera");
  });

  it("ignores blank urls and works without a cover or without images", () => {
    expect(serviceSlides(makeService({ imageUrl: "  ", images: [image(1, " ", 1)] }))).toEqual([]);
    expect(serviceSlides(makeService({ imageUrl: null, images: undefined }))).toEqual([]);
    expect(serviceSlides(makeService({ imageUrl: "https://img/c.jpg", images: undefined })).map((s) => s.src)).toEqual([
      "https://img/c.jpg",
    ]);
  });

  it("gives every slide a unique id and a Spanish alt text (caption, else the service name)", () => {
    const slides = serviceSlides(
      makeService({ name: "Desayuno sorpresa", imageUrl: "https://img/c.jpg", images: [image(7, "https://img/a.jpg", 1, " Bandeja ")] }),
    );

    expect(new Set(slides.map((s) => s.id)).size).toBe(2);
    expect(slides.map((s) => s.alt)).toEqual(["Desayuno sorpresa", "Bandeja"]);
    expect(slides[1].caption).toBe("Bandeja");
  });
});

describe("orderServicesForPage", () => {
  it("orders by type (events, breakfasts, pastry) and then by name", () => {
    const services = [
      makeService({ id: 1, name: "Pasteles", serviceType: "Reposteria" }),
      makeService({ id: 2, name: "Zona de postres", serviceType: "EventsPlanner" }),
      makeService({ id: 3, name: "Desayuno", serviceType: "DesayunosPersonalizados" }),
      makeService({ id: 4, name: "ángeles", serviceType: "EventsPlanner" }),
      makeService({ id: 5, name: "Bodas", serviceType: "EventsPlanner" }),
    ];

    expect(orderServicesForPage(services).map((s) => s.id)).toEqual([4, 5, 2, 3, 1]);
  });

  it("does not mutate the input", () => {
    const services = [makeService({ id: 2, serviceType: "Reposteria" }), makeService({ id: 1 })];
    orderServicesForPage(services);
    expect(services.map((s) => s.id)).toEqual([2, 1]);
  });
});

describe("serviceShowcaseGroups", () => {
  it("groups the ordered services by type with the type anchors used by the home page", () => {
    const groups = serviceShowcaseGroups([
      makeService({ id: 1, name: "Pasteles", serviceType: "Reposteria" }),
      makeService({ id: 2, name: "Mesa de dulces", serviceType: "EventsPlanner" }),
    ]);

    expect(groups.map((g) => [g.type, g.anchor])).toEqual([
      ["EventsPlanner", "events-planner"],
      ["Reposteria", "reposteria"],
    ]);
    expect(groups[0].sections[0].name).toBe("Mesa de dulces");
  });

  it("gives each service a unique section anchor that never collides with a type anchor", () => {
    const groups = serviceShowcaseGroups([
      makeService({ id: 1, name: "Repostería", serviceType: "Reposteria" }),
      makeService({ id: 2, name: "Bodas!", serviceType: "EventsPlanner" }),
      makeService({ id: 3, name: "bodas", serviceType: "EventsPlanner" }),
      makeService({ id: 4, name: "  ", serviceType: "EventsPlanner" }),
    ]);
    const anchors = groups.flatMap((g) => g.sections.map((s) => s.anchor));

    expect(anchors).toContain("servicio-reposteria");
    expect(anchors).toContain("servicio-4");
    expect(new Set(anchors).size).toBe(anchors.length);
    expect(anchors.every((a) => a.startsWith("servicio-"))).toBe(true);
  });

  it("names a service without name after its type and carries its slides", () => {
    const [group] = serviceShowcaseGroups([
      makeService({ id: 9, name: null, serviceType: "DesayunosPersonalizados", imageUrl: "https://img/c.jpg" }),
    ]);

    expect(group.sections[0].name).toBe("Desayunos personalizados");
    expect(group.sections[0].slides).toHaveLength(1);
  });

  it("returns no groups without services", () => {
    expect(serviceShowcaseGroups([])).toEqual([]);
  });
});

describe("buildServiceWhatsAppUrl", () => {
  it("prefills the message with the service name", () => {
    expect(buildServiceWhatsAppUrl("+1 (809) 555-0123", "Mesa de dulces")).toBe(
      "https://wa.me/18095550123?text=Hola!%20Me%20interesa%20el%20servicio%20Mesa%20de%20dulces",
    );
  });

  it("encodes special characters", () => {
    expect(buildServiceWhatsAppUrl("18095550123", "Bodas & más")).toBe(
      `https://wa.me/18095550123?text=${encodeURIComponent("Hola! Me interesa el servicio Bodas & más")}`,
    );
  });

  it("returns null without a WhatsApp number", () => {
    expect(buildServiceWhatsAppUrl(null, "Mesa de dulces")).toBeNull();
    expect(buildServiceWhatsAppUrl("  ", "Mesa de dulces")).toBeNull();
  });
});

describe("moveItem", () => {
  it("moves an item up or down by one position", () => {
    expect(moveItem(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
  });

  it("leaves the list as it is at the edges or with an invalid index, and never mutates it", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 0, -1)).toEqual(list);
    expect(moveItem(list, 2, 1)).toEqual(list);
    expect(moveItem(list, 7, -1)).toEqual(list);
    expect(moveItem(list, 1, 1)).not.toBe(list);
    expect(list).toEqual(["a", "b", "c"]);
  });
});

describe("gallery limits", () => {
  it("allows up to 12 photos per service", () => {
    expect(MAX_SERVICE_IMAGES).toBe(12);
    expect(remainingGallerySlots(4)).toBe(8);
    expect(remainingGallerySlots(12)).toBe(0);
    expect(remainingGallerySlots(15)).toBe(0);
  });

  it("labels the count as 'n de 12'", () => {
    expect(galleryCountLabel(4)).toBe("4 de 12");
    expect(galleryCountLabel(0)).toBe("0 de 12");
  });
});
