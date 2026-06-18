import { del, get, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  MANIFEST_PATH,
  MODEL_UPLOAD_PREFIX,
  createListingId,
  getFileName,
  getReadableFormat,
  isAllowedDownloadModel,
  isAllowedPreviewModel,
  parseManifest,
  type ModelListing,
  type ModelManifest,
  type UploadedBlobInfo,
} from "@/lib/model-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateModelBody = {
  title?: string;
  description?: string;
  category?: string;
  model?: UploadedBlobInfo;
  download?: UploadedBlobInfo | null;
};

class HttpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function requireBlobToken() {
  if (!hasBlobToken()) {
    throw new HttpError("BLOB_READ_WRITE_TOKEN is not configured on the server.", 500);
  }
}

function requireAdmin(request: Request) {
  const expectedPassword = process.env.ADMIN_UPLOAD_PASSWORD;

  if (!expectedPassword) {
    throw new HttpError("ADMIN_UPLOAD_PASSWORD is not configured on the server.", 500);
  }

  if (request.headers.get("x-admin-password") !== expectedPassword) {
    throw new HttpError("Invalid admin password.", 401);
  }
}

function cleanText(value: string | undefined, fallback: string, maxLength: number) {
  const text = value?.trim() ?? "";
  return (text || fallback).slice(0, maxLength);
}

function assertUploadedBlob(value: UploadedBlobInfo | undefined, label: string) {
  if (!value || typeof value !== "object") {
    throw new HttpError(`${label} is missing.`);
  }

  if (
    typeof value.url !== "string" ||
    typeof value.downloadUrl !== "string" ||
    typeof value.pathname !== "string"
  ) {
    throw new HttpError(`${label} upload data is invalid.`);
  }

  if (!value.pathname.startsWith(MODEL_UPLOAD_PREFIX)) {
    throw new HttpError(`${label} upload path is invalid.`);
  }

  return value;
}

async function readManifest(): Promise<ModelManifest> {
  const blob = await get(MANIFEST_PATH, { access: "public", useCache: false });

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return { models: [] };
  }

  return parseManifest(await new Response(blob.stream).text());
}

async function writeManifest(manifest: ModelManifest) {
  await put(MANIFEST_PATH, JSON.stringify(manifest, null, 2), {
    access: "public",
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json",
  });
}

function errorResponse(error: unknown) {
  const status = error instanceof HttpError ? error.status : 500;
  const message =
    error instanceof Error ? error.message : "The model request could not be completed.";

  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  if (!hasBlobToken()) {
    return NextResponse.json(
      {
        configured: false,
        message: "BLOB_READ_WRITE_TOKEN is not configured.",
        models: [],
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const manifest = await readManifest();
    return NextResponse.json(
      { configured: true, models: manifest.models },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireBlobToken();
    requireAdmin(request);

    const body = (await request.json()) as CreateModelBody;
    const model = assertUploadedBlob(body.model, "Preview model");
    const download = body.download
      ? assertUploadedBlob(body.download, "Download package")
      : undefined;

    if (!isAllowedPreviewModel(model.pathname)) {
      throw new HttpError("The rotatable preview must be a GLB or GLTF file.");
    }

    if (download && !isAllowedDownloadModel(download.pathname)) {
      throw new HttpError("The download package type is not allowed.");
    }

    const title = cleanText(body.title, getFileName(model.pathname), 90);
    const description = cleanText(
      body.description,
      "Game-ready Ethiopian 3D model asset.",
      360,
    );
    const uploadedAt = new Date().toISOString();
    const blobPathnames = [model.pathname, download?.pathname].filter(Boolean) as string[];

    const listing: ModelListing = {
      id: createListingId(title, getFileName(model.pathname)),
      title,
      description,
      category: cleanText(body.category, "3D Model", 48),
      format: getReadableFormat(model.pathname),
      modelUrl: model.url,
      modelDownloadUrl: model.downloadUrl,
      downloadUrl: download?.downloadUrl ?? model.downloadUrl,
      fileName: getFileName(model.pathname),
      downloadFileName: download ? getFileName(download.pathname) : undefined,
      size: Number(model.size ?? 0),
      uploadedAt,
      blobPathnames: Array.from(new Set(blobPathnames)),
    };

    const manifest = await readManifest();
    const models = [listing, ...manifest.models].sort((a, b) =>
      b.uploadedAt.localeCompare(a.uploadedAt),
    );

    await writeManifest({ models });

    return NextResponse.json({ model: listing, models });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireBlobToken();
    requireAdmin(request);

    const body = (await request.json()) as { id?: string };
    const id = body.id?.trim();

    if (!id) {
      throw new HttpError("A model id is required.");
    }

    const manifest = await readManifest();
    const target = manifest.models.find((model) => model.id === id);

    if (!target) {
      throw new HttpError("Model listing was not found.", 404);
    }

    if (target.blobPathnames.length) {
      await del(target.blobPathnames);
    }

    const models = manifest.models.filter((model) => model.id !== id);
    await writeManifest({ models });

    return NextResponse.json({ models });
  } catch (error) {
    return errorResponse(error);
  }
}
