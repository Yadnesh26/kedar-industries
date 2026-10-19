import certifications from '@/data/certifications.json';

export const certSlug = (short: string) =>
  'cert-' + short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Management-system certificates have their own card; the CPRI and IEC 61439
// badges both point at the CPRI type-test evidence section.
export function certHref(label: string) {
  const match = certifications.managementSystems.find((c) => c.short === label);
  return `/about/quality/#${match ? certSlug(match.short) : 'cpri'}`;
}
