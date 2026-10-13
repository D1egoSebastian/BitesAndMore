"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Query parameter that holds the selected category slug, e.g. /productos?categoria=galletas. */
export const CATEGORY_PARAM = "categoria";

/**
 * Reports the category in the URL to the catalog. It renders nothing and must sit inside its own
 * <Suspense>: on the statically prerendered /productos only this empty component is rendered on
 * the client, so the product grid stays in the prerendered HTML.
 */
export function CategoryParamSync({ onChange }: { onChange: (slug: string | null) => void }) {
  const category = useSearchParams().get(CATEGORY_PARAM);

  useEffect(() => {
    onChange(category);
  }, [category, onChange]);

  return null;
}
