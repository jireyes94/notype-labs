export const LICENSE_IDS = ["mp3", "wav", "unlimited"] as const;

export type LicenseId = (typeof LICENSE_IDS)[number];

export type BeatLicense = {
  id: LicenseId;
  name: string;
  description: string;
  multiplier: number;
};

export const BEAT_LICENSES: readonly BeatLicense[] = [
  {
    id: "mp3",
    name: "MP3 Lease",
    description: "Uso limitado",
    multiplier: 1,
  },
  {
    id: "wav",
    name: "WAV Premium",
    description: "Alta calidad",
    multiplier: 1.5,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    description: "Uso ilimitado / Stems",
    multiplier: 4,
  },
];

export function getLicense(licenseId: LicenseId): BeatLicense {
  const license = BEAT_LICENSES.find(({ id }) => id === licenseId);

  if (!license) {
    throw new Error(`Licencia desconocida: ${licenseId}`);
  }

  return license;
}

export function calculateLicensePrice(
  basePrice: number,
  licenseId: LicenseId,
): number {
  return Math.round(basePrice * getLicense(licenseId).multiplier);
}

export function formatArs(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}
