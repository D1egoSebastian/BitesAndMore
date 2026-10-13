// Shapes returned and accepted by BitesAndMore.API (ASP.NET, camelCase JSON).
// Every text field can be null: the backend does not validate required fields.

export const SERVICE_TYPES = ["Reposteria", "EventsPlanner", "DesayunosPersonalizados"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export interface Category {
  id: number;
  name: string | null;
  description: string | null;
}

export interface Product {
  id: number;
  name: string | null;
  slug: string | null;
  description: string | null;
  /** Free text, shown as-is (ADR-002). */
  price: string | null;
  imageUrl: string | null;
  categoryId: number;
  category: Category | null;
  isAvailable: boolean;
  createdDate: string | null;
  /** Prefilled wa.me link built by the API; null when no WhatsApp number is configured. */
  whatsAppUrl: string | null;
}

/** A photo of a service's gallery (spec 011). The service's own imageUrl stays as its cover. */
export interface ServiceImage {
  id: number;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export interface Service {
  id: number;
  name: string | null;
  description: string | null;
  /** Cover photo. */
  imageUrl: string | null;
  price: string | null;
  serviceType: ServiceType;
  /**
   * Gallery, ordered by the API. Optional because an API deployed before spec 011 does not send it:
   * always read it through sortServiceImages (lib/service-gallery.ts), which treats it as [].
   */
  images?: ServiceImage[] | null;
}

export interface BusinessInfo {
  businessName: string | null;
  mission: string | null;
  vision: string | null;
  phoneNumber: string | null;
  whatsAppNumber: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
}

export interface CategoryInput {
  name: string;
  description: string | null;
}

export interface ProductInput {
  name: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  categoryId: number;
  isAvailable: boolean;
}

export interface ServiceInput {
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: string | null;
  serviceType: ServiceType;
}

export type BusinessInfoInput = BusinessInfo;

export interface ServiceImageInput {
  url: string;
  caption: string | null;
}
