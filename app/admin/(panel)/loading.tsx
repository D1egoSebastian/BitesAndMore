export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <div aria-hidden="true" className="animate-pulse">
        <div className="h-9 w-56 max-w-full rounded-lg bg-surface" />
        <div className="mt-3 h-5 w-80 max-w-full rounded-md bg-surface" />
        <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 py-4">
              <div className="size-16 shrink-0 rounded-lg bg-surface" />
              <div className="flex-1">
                <div className="h-5 w-1/2 rounded-md bg-surface" />
                <div className="mt-2 h-4 w-1/4 rounded-md bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
