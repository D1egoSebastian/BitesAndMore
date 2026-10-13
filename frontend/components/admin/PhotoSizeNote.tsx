import { AlertIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Friendly, non-blocking hint shown next to a photo preview when the photo is small (spec 012).
 * Butter tile with cocoa text: advice, not an error; the upload still goes ahead.
 */
export function PhotoSizeNote({ message, className }: { message: string; className?: string }) {
  return (
    <p className={cn("flex max-w-[52ch] items-start gap-2 rounded-xl bg-butter px-3.5 py-2.5 text-sm", className)}>
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
