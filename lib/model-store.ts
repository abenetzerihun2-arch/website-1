export type UploadedBlobInfo = {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType?: string;
  size?: number;
  uploadedAt?: string | Date;
};

export type ModelListing = {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  modelUrl: string;
  modelDownloadUrl: string;
  downloadUrl: string;
  fileName: string;
  downloadFileName?: string;
  size: number;
  uploadedAt: string;
  blobPathnames: string[];
};

export type ModelManifest = {
  models: ModelListing[];
};

export const MANIFEST_PATH = "models/manifest.json";
export const MODEL_UPLOAD_PREFIX = "uploads/models/";
export const MAX_MODEL_UPLOAD_BYTES = 1024 * 1024 * 1024;

export const PREVIEW_MODEL_EXTENSIONS = [".glb", ".gltf"];
export const DOWNLOAD_MODEL_EXTENSIONS = [
  ".glb",
  ".gltf",
  ".usdz",
  ".fbx",
  ".obj",
  ".blend",
  ".zip",
  ".rar",
  ".7z",
  ".dae",
  ".stl",
  ".ply",
];

export function getExtension(name: string) {
  const cleanName = name.split("?")[0] ?? name;
  const dotIndex = cleanName.lastIndexOf(".");
  return dotIndex >= 0 ? cleanName.slice(dotIndex).toLowerCase() : "";
}

export function getFileName(pathname: string) {
  const cleanPath = pathname.split("?")[0] ?? pathname;
  return cleanPath.split("/").filter(Boolean).pop() ?? "model-file";
}

export function sanitizeFileName(name: string) {
  const sanitized = name
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .toLowerCase();

  return sanitized || "model-file";
}

export function createListingId(title: string, fileName: string) {
  const source = `${title}-${fileName}`;
  const slug =
    source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 54) || "model";

  return `${slug}-${Date.now().toString(36)}`;
}

export function isAllowedPreviewModel(name: string) {
  return PREVIEW_MODEL_EXTENSIONS.includes(getExtension(name));
}

export function isAllowedDownloadModel(name: string) {
  return DOWNLOAD_MODEL_EXTENSIONS.includes(getExtension(name));
}

export function getReadableFormat(name: string) {
  const extension = getExtension(name).replace(".", "");
  return extension ? extension.toUpperCase() : "MODEL";
}

export function formatBytes(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function parseManifest(text: string): ModelManifest {
  try {
    const data = JSON.parse(text) as Partial<ModelManifest>;
    if (!Array.isArray(data.models)) return { models: [] };

    return {
      models: data.models.filter((model): model is ModelListing => {
        return (
          typeof model?.id === "string" &&
          typeof model.title === "string" &&
          typeof model.modelUrl === "string" &&
          typeof model.downloadUrl === "string" &&
          Array.isArray(model.blobPathnames)
        );
      }),
    };
  } catch {
    return { models: [] };
  }
}
