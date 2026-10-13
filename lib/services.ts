import { SERVICE_TYPES, type Service, type ServiceType } from "./api/types";

const LABELS: Record<ServiceType, string> = {
  Reposteria: "Repostería",
  EventsPlanner: "Events planner",
  DesayunosPersonalizados: "Desayunos personalizados",
};

const ANCHORS: Record<ServiceType, string> = {
  Reposteria: "reposteria",
  EventsPlanner: "events-planner",
  DesayunosPersonalizados: "desayunos-personalizados",
};

export function serviceTypeLabel(type: ServiceType): string {
  return LABELS[type];
}

export function serviceTypeAnchor(type: ServiceType): string {
  return ANCHORS[type];
}

export function isServiceType(value: unknown): value is ServiceType {
  return typeof value === "string" && (SERVICE_TYPES as readonly string[]).includes(value);
}

export interface ServiceGroup {
  type: ServiceType;
  label: string;
  anchor: string;
  services: Service[];
}

export function groupServicesByType(services: Service[]): ServiceGroup[] {
  return SERVICE_TYPES.map((type) => ({
    type,
    label: LABELS[type],
    anchor: ANCHORS[type],
    services: services.filter((service) => service.serviceType === type),
  })).filter((group) => group.services.length > 0);
}

/** Image for an occasion tile on the home page: the first service of that type with a photo. */
export function serviceTypeCover(services: Service[], type: ServiceType): string | null {
  const withImage = services.find((service) => service.serviceType === type && service.imageUrl?.trim());
  return withImage?.imageUrl?.trim() ?? null;
}
