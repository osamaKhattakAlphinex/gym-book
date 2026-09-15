/**
 * Public marketing routes.
 *
 * Shared between the site header and `AppChrome`, which uses the list to keep
 * the owner's dashboard navigation off the public site.
 */
export const MARKETING_ROUTES = ["/programs", "/schedule", "/trainers", "/pricing", "/contact"] as const;

export const MARKETING_NAV = [
  { href: "/programs", label: "Programs" },
  { href: "/schedule", label: "Schedule" },
  { href: "/trainers", label: "Trainers" },
  { href: "/pricing", label: "Membership" },
  { href: "/contact", label: "Contact" },
] as const;
