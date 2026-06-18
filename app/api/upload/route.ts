import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import {
  DOWNLOAD_MODEL_EXTENSIONS,
  MAX_MODEL_UPLOAD_BYTES,
  MODEL_UPLOAD_PREFIX,
  isAllowedPreviewModel,
  isAllowedDownloadModel,
} from "@/lib/model-store";

export const runtime = "nodejs";

class HttpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
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

function parseClientPayload(clientPayload: string | null) {
  if (!clientPayload) return { kind: "download" };

  try {
    const payload = JSON.parse(clientPayload) as { kind?: string };
    return { kind: payload.kind ?? "download" };
  } catch {
    return { kind: "download" };
  }
}

function errorResponse(error: unknown) {
  const status = error instanceof HttpError ? error.status : 500;
  const message =
    error instanceof Error ? error.message : "The upload request could not be completed.";

  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload request body." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        requireAdmin(request);

        if (!pathname.startsWith(MODEL_UPLOAD_PREFIX)) {
          throw new HttpError("Uploads must stay inside the model upload folder.");
        }

        const { kind } = parseClientPayload(clientPayload);
        const isPreview = kind === "preview";

        if (isPreview && !isAllowedPreviewModel(pathname)) {
          throw new HttpError("The rotatable preview must be a GLB or GLTF file.");
        }

        if (!isPreview && !isAllowedDownloadModel(pathname)) {
          throw new HttpError(
            `Download packages must use one of these extensions: ${DOWNLOAD_MODEL_EXTENSIONS.join(", ")}`,
          );
        }

        return {
          addRandomSuffix: false,
          allowOverwrite: false,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
          maximumSizeInBytes: MAX_MODEL_UPLOAD_BYTES,
          tokenPayload: clientPayload,
        };
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
