import type { Service, ServiceImage, ServiceType } from "./api/types";
import { buildWhatsAppContactUrl } from "./contact";
import { serviceTypeAnchor, serviceTypeLabel } from "./services";
import { slugify } from "./slug";

/** Gallery size limit per service; mirrors ServiceController.MaxImagesPerService in the API. */
export const MAX_SERVICE_IMAGES = 12;

/** Order of the sections on /servicios (approved design): events first, pastry last. */
const PAGE_TYPE_ORDER: readonly ServiceType[] = ["EventsPlanner", "DesayunosPersonalizados", "Reposteria"];

export interface ServiceSlide {
  id: string;
  src: string;
  /** Spanish, descriptive: the caption when there is one, otherwise the service name. */
  alt: string;
  caption: string | null;
}

export interface ServiceSection {
  service: Service;
  /** Display name: the service name, or its type label when the name is empty. */
  name: string;
  /** Unique id on /servicios, always prefixed so it never collides with a type anchor. */
  anchor: string;
  slides: ServiceSlide[];
}

export interface ServiceShowcaseGroup {
  type: ServiceType;
  label: string;
  /** Same anchor as before the redesign, so the home page tiles keep working. */
  anchor: string;
  sections: ServiceSection[];
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Gallery photos in display order (sortOrder, then id). A missing list counts as empty. */
export function sortServiceImages(images: ServiceImage[] | null | undefined): ServiceImage[] {
  return [...(images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

function displayName(service: Service): string {
  return clean(service.name) ?? serviceTypeLabel(service.serviceType);
}

/**
 * Carousel slides of a service: the cover first, then the gallery in order. Blank urls are skipped and
 * a url already shown is not repeated (if the repeated photo has a caption and the first one does not,
 * the first one takes it).
 */
export function serviceSlides(service: Service): ServiceSlide[] {
  const name = displayName(service);
  const slides: ServiceSlide[] = [];
  const byUrl = new Map<string, ServiceSlide>();

  function add(id: string, rawUrl: string | null | undefined, rawCaption: string | null | undefined) {
    const src = clean(rawUrl);
    if (!src) return;
    const caption = clean(rawCaption);
    const existing = byUrl.get(src);
    if (existing) {
      if (!existing.caption && caption) {
        existing.caption = caption;
        existing.alt = caption;
      }
      return;
    }
    const slide: ServiceSlide = { id, src, alt: caption ?? name, caption };
    byUrl.set(src, slide);
    slides.push(slide);
  }

  add(`service-${service.id}-cover`, service.imageUrl, null);
  for (const image of sortServiceImages(service.images)) {
    add(`service-${service.id}-image-${image.id}`, image.url, image.caption);
  }
  return slides;
}

function typeRank(type: ServiceType): number {
  const rank = PAGE_TYPE_ORDER.indexOf(type);
  return rank === -1 ? PAGE_TYPE_ORDER.length : rank;
}

/** Services in page order: by type (events, breakfasts, pastry), then by name, then by id. */
export function orderServicesForPage(services: Service[]): Service[] {
  return [...services].sort(
    (a, b) =>
      typeRank(a.serviceType) - typeRank(b.serviceType) ||
      displayName(a).localeCompare(displayName(b), "es", { sensitivity: "base" }) ||
      a.id - b.id,
  );
}

/**
 * Sections of /servicios grouped by type (each group keeps the type anchor the home page links to).
 * Every service gets a unique section anchor, "servicio-<slug>", falling back to its id.
 */
export function serviceShowcaseGroups(services: Service[]): ServiceShowcaseGroup[] {
  const used = new Set<string>();
  const groups: ServiceShowcaseGroup[] = [];

  for (const service of orderServicesForPage(services)) {
    const slug = slugify(service.name);
    let anchor = `servicio-${slug || service.id}`;
    if (used.has(anchor)) anchor = `servicio-${slug ? `${slug}-` : ""}${service.id}`;
    used.add(anchor);

    let group = groups.find((candidate) => candidate.type === service.serviceType);
    if (!group) {
      group = {
        type: service.serviceType,
        label: serviceTypeLabel(service.serviceType),
        anchor: serviceTypeAnchor(service.serviceType),
        sections: [],
      };
      groups.push(group);
    }
    group.sections.push({ service, name: displayName(service), anchor, slides: serviceSlides(service) });
  }

  return groups;
}

/** wa.me link with the service already written in the message; null without a WhatsApp number. */
export function buildServiceWhatsAppUrl(number: string | null | undefined, serviceName: string): string | null {
  return buildWhatsAppContactUrl(number, `Hola! Me interesa el servicio ${serviceName}`);
}

/** New list with the item at `index` moved by `delta` positions; unchanged copy when it cannot move. */
export function moveItem<T>(list: readonly T[], index: number, delta: number): T[] {
  const copy = [...list];
  const target = index + delta;
  if (index < 0 || index >= copy.length || target < 0 || target >= copy.length) return copy;
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  return copy;
}

/** How many more photos the gallery accepts. */
export function remainingGallerySlots(count: number): number {
  return Math.max(0, MAX_SERVICE_IMAGES - count);
}

/** "4 de 12". */
export function galleryCountLabel(count: number): string {
  return `${count} de ${MAX_SERVICE_IMAGES}`;
}
