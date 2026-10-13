import Link from "next/link";
import { AdaptiveImage } from "@/components/media/AdaptiveImage";
import { OccasionArt } from "@/components/media/DessertArt";
import { StaggerItem, StaggerList } from "@/components/motion/Reveal";
import { SERVICE_TYPES, type Service, type ServiceType } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { groupServicesByType, serviceTypeAnchor, serviceTypeCover, serviceTypeLabel } from "@/lib/services";
import { TONE_BG, toneForServiceType } from "@/lib/tones";

const BLURBS: Record<ServiceType, string> = {
  Reposteria: "Pasteles, cupcakes y postres por encargo para cumpleaños, bodas y bautizos.",
  EventsPlanner: "Mesas de dulces y detalles para tu evento, de principio a fin.",
  DesayunosPersonalizados: "Desayunos preparados para sorprender a alguien especial.",
};

/**
 * "Para cada ocasión": the three service types as a bento grid on pastel tiles. From tablet up the
 * first tile is large and spans two rows; on phones the tiles form a horizontal scroll-snap row
 * (the scroll is contained in the list). Each tile has art in its top-right corner: the service
 * photo when there is one, otherwise the flat illustration of the approved design. On hover the
 * tile lifts and the art zooms and turns a little. Tiles scale in one after another on scroll.
 */
export function OccasionTiles({ services }: { services: Service[] }) {
  const withServices = new Set(groupServicesByType(services).map((group) => group.type));

  return (
    <StaggerList className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:grid-rows-[16.25rem_16.25rem] md:gap-5 md:overflow-visible md:px-0 md:pb-0">
      {SERVICE_TYPES.map((type, index) => {
        const label = serviceTypeLabel(type);
        const large = index === 0;
        const cover = serviceTypeCover(services, type);
        // Anchors only exist on /servicios for types that have services.
        const href = withServices.has(type) ? `/servicios#${serviceTypeAnchor(type)}` : "/servicios";
        return (
          <StaggerItem
            key={type}
            variant="scale"
            className={cn("w-[72%] shrink-0 snap-start sm:w-[46%] md:w-auto", large && "md:row-span-2")}
          >
            <Link
              href={href}
              className={cn(
                "group relative flex h-full min-h-[13.125rem] flex-col justify-end gap-2 overflow-hidden rounded-3xl p-6 transition duration-[450ms] ease-out-soft hover:-translate-y-1.5 active:scale-[0.985] md:min-h-0 md:rounded-[2rem] [touch-action:manipulation]",
                TONE_BG[toneForServiceType(type)],
                large ? "md:gap-2.5 md:p-9" : "md:p-8",
              )}
            >
              <div
                aria-hidden="true"
                className={cn(
                  "absolute hidden transition-transform duration-[600ms] ease-out-soft group-hover:rotate-[-2deg] group-hover:scale-[1.07] md:block",
                  large ? "right-9 top-9 size-[14.375rem]" : "right-8 top-6 size-[8.5rem]",
                )}
              >
                {cover ? (
                  <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white/40 shadow-[0_14px_30px_-14px_rgb(59_37_34/0.45)]">
                    <AdaptiveImage src={cover} alt="" sizes={large ? "230px" : "136px"} />
                  </div>
                ) : (
                  <OccasionArt type={type} className="size-full" />
                )}
              </div>

              <h3 className={cn("relative text-2xl", large ? "md:text-[2.125rem]" : "md:text-[1.75rem]")}>{label}</h3>
              <p className={cn("relative max-w-[24em] text-sm leading-normal text-muted", large ? "md:max-w-[22em] md:text-base" : "md:text-[0.9375rem]")}>
                {BLURBS[type]}
              </p>
              {large && (
                <span className="relative mt-1.5 hidden w-max font-semibold after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out-soft group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100 md:inline-block">
                  Ver servicio
                </span>
              )}
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerList>
  );
}
