/**
 * Page transition for the public site. A template remounts on every route change, so the
 * CSS entrance (.page-enter: fade + 8 px lift, 250 ms) replays on each navigation. It is CSS
 * rather than framer-motion so the first load never waits for hydration to show the page.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
