import { describe, expect, it } from "vitest";
import type { Service } from "./api/types";
import { groupServicesByType, isServiceType, serviceTypeAnchor, serviceTypeCover, serviceTypeLabel } from "./services";

function makeService(overrides: Partial<Service>): Service {
  return {
    id: 1,
    name: "Servicio",
    description: null,
    imageUrl: null,
    price: null,
    serviceType: "Reposteria",
    ...overrides,
  };
}

describe("serviceTypeLabel", () => {
  it("returns the Spanish label for each service type", () => {
    expect(serviceTypeLabel("Reposteria")).toBe("Repostería");
    expect(serviceTypeLabel("EventsPlanner")).toBe("Events planner");
    expect(serviceTypeLabel("DesayunosPersonalizados")).toBe("Desayunos personalizados");
  });
});

describe("serviceTypeAnchor", () => {
  it("returns a stable, URL-friendly anchor per type", () => {
    expect(serviceTypeAnchor("Reposteria")).toBe("reposteria");
    expect(serviceTypeAnchor("EventsPlanner")).toBe("events-planner");
    expect(serviceTypeAnchor("DesayunosPersonalizados")).toBe("desayunos-personalizados");
  });
});

describe("isServiceType", () => {
  it("accepts only the API enum values", () => {
    expect(isServiceType("EventsPlanner")).toBe(true);
    expect(isServiceType("Catering")).toBe(false);
    expect(isServiceType(null)).toBe(false);
  });
});

describe("groupServicesByType", () => {
  it("groups services in the canonical type order and omits empty groups", () => {
    const services = [
      makeService({ id: 1, serviceType: "DesayunosPersonalizados" }),
      makeService({ id: 2, serviceType: "Reposteria" }),
      makeService({ id: 3, serviceType: "Reposteria" }),
    ];

    const groups = groupServicesByType(services);

    expect(groups.map((g) => g.type)).toEqual(["Reposteria", "DesayunosPersonalizados"]);
    expect(groups[0].label).toBe("Repostería");
    expect(groups[0].services.map((s) => s.id)).toEqual([2, 3]);
  });

  it("returns no groups for an empty list", () => {
    expect(groupServicesByType([])).toEqual([]);
  });
});

describe("serviceTypeCover", () => {
  it("returns the first image among the services of that type", () => {
    const services = [
      makeService({ id: 1, serviceType: "Reposteria", imageUrl: null }),
      makeService({ id: 2, serviceType: "EventsPlanner", imageUrl: "https://img/events.jpg" }),
      makeService({ id: 3, serviceType: "Reposteria", imageUrl: "https://img/reposteria.jpg" }),
    ];

    expect(serviceTypeCover(services, "Reposteria")).toBe("https://img/reposteria.jpg");
  });

  it("returns null when no service of that type has an image", () => {
    const services = [makeService({ serviceType: "DesayunosPersonalizados", imageUrl: "  " })];

    expect(serviceTypeCover(services, "DesayunosPersonalizados")).toBeNull();
    expect(serviceTypeCover([], "Reposteria")).toBeNull();
  });
});
