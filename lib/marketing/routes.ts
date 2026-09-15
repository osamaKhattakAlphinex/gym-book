/**
 * Public marketing routes.
 *
 * Shared between the site header and `AppChrome`, which uses the list to keep
 * the owner's dashboard navigation off the public site.
 */
export const MARKETING_ROUTES = ["/features", "/integrations", "/pricing", "/contact"] as const;

export const MARKETING_NAV = [
  { href: "/features", label: "Features" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;
