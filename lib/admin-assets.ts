import "server-only";

export type AdminAssetKind = "preview" | "cover" | "mp3" | "wav" | "unlimited";

export type AdminAssetInput = {
  name: string;
  size: number;
  type: string;
};

export const ASSET_RULES: Record<AdminAssetKind, { max: number; types: string[] }> = {
  preview: { max: 15 * 1024 * 1024, types: ["audio/mpeg"] },
  cover: { max: 5 * 1024 * 1024, types: ["image/jpeg", "image/png", "image/webp"] },
  mp3: { max: 25 * 1024 * 1024, types: ["audio/mpeg"] },
  wav: { max: 150 * 1024 * 1024, types: ["audio/wav", "audio/x-wav"] },
  unlimited: {
    max: 1024 * 1024 * 1024,
    types: ["application/zip", "application/x-zip-compressed", "application/x-compressed"],
  },
};

export function validateAsset(kind: AdminAssetKind, input: AdminAssetInput): string | null {
  const rule = ASSET_RULES[kind];
  if (!input.name.trim() || !Number.isSafeInteger(input.size) || input.size <= 0) {
    return `${kind}: archivo inválido`;
  }
  if (input.size > rule.max) return `${kind}: supera el tamaño máximo permitido`;
  if (!rule.types.includes(input.type)) return `${kind}: tipo de archivo no permitido`;
  return null;
}

export function safeExtension(input: AdminAssetInput, fallback: string): string {
  const extension = input.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : fallback;
}
