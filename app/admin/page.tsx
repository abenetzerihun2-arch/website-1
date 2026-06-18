"use client";

import Link from "next/link";
import Script from "next/script";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  DOWNLOAD_MODEL_EXTENSIONS,
  MODEL_UPLOAD_PREFIX,
  PREVIEW_MODEL_EXTENSIONS,
  formatBytes,
  isAllowedDownloadModel,
  isAllowedPreviewModel,
  sanitizeFileName,
  type ModelListing,
  type UploadedBlobInfo,
} from "@/lib/model-store";

type ModelsResponse = {
  configured?: boolean;
  message?: string;
  models?: ModelListing[];
  error?: string;
};

const previewAccept = PREVIEW_MODEL_EXTENSIONS.join(",");
const downloadAccept = DOWNLOAD_MODEL_EXTENSIONS.join(",");

function createUploadFolder() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Architecture");
  const [description, setDescription] = useState("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [models, setModels] = useState<ModelListing[]>([]);
  const [configured, setConfigured] = useState(true);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const totalSize = useMemo(() => {
    return (previewFile?.size ?? 0) + (downloadFile?.size ?? 0);
  }, [downloadFile, previewFile]);

  useEffect(() => {
    void refreshModels();
  }, []);

  async function refreshModels() {
    try {
      const response = await fetch("/api/models", { cache: "no-store" });
      const data = (await response.json()) as ModelsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load uploaded models.");
      }

      setConfigured(data.configured !== false);
      setModels(data.models ?? []);
      if (data.message) setStatus(data.message);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load models.");
    }
  }

  async function uploadAsset(
    kind: "preview" | "download",
    file: File,
    folder: string,
    progressStart: number,
    progressEnd: number,
  ): Promise<UploadedBlobInfo> {
    const { upload } = await import("@vercel/blob/client");
    const pathname = `${MODEL_UPLOAD_PREFIX}${folder}/${kind}-${sanitizeFileName(file.name)}`;

    return upload(pathname, file, {
      access: "public",
      clientPayload: JSON.stringify({ kind }),
      contentType: file.type || undefined,
      handleUploadUrl: "/api/upload",
      headers: { "x-admin-password": password },
      multipart: file.size > 8 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => {
        const scaled = progressStart + (percentage / 100) * (progressEnd - progressStart);
        setUploadProgress(Math.round(scaled));
      },
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Enter the admin password.");
      return;
    }

    if (!previewFile) {
      setError("Choose a GLB or GLTF preview model.");
      return;
    }

    if (!isAllowedPreviewModel(previewFile.name)) {
      setError("The rotatable preview must be a GLB or GLTF file.");
      return;
    }

    if (downloadFile && !isAllowedDownloadModel(downloadFile.name)) {
      setError("The download package file type is not allowed.");
      return;
    }

    setIsUploading(true);
    setStatus("Uploading preview model");
    setUploadProgress(0);

    try {
      const folder = createUploadFolder();
      const previewBlob = await uploadAsset(
        "preview",
        previewFile,
        folder,
        0,
        downloadFile ? 55 : 85,
      );
      let downloadBlob: UploadedBlobInfo | undefined;

      if (downloadFile) {
        setStatus("Uploading download package");
        downloadBlob = await uploadAsset("download", downloadFile, folder, 55, 85);
      }

      setStatus("Saving listing");
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          category,
          description,
          download: downloadBlob,
          model: previewBlob,
          title,
        }),
      });
      const data = (await response.json()) as ModelsResponse & { model?: ModelListing };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save the model listing.");
      }

      setModels(data.models ?? (data.model ? [data.model, ...models] : models));
      setTitle("");
      setDescription("");
      setPreviewFile(null);
      setDownloadFile(null);
      setUploadProgress(100);
      setStatus("Published");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Upload failed.");
      setStatus("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteModel(model: ModelListing) {
    if (!password.trim()) {
      setError("Enter the admin password before deleting.");
      return;
    }

    if (!window.confirm(`Delete ${model.title}?`)) return;

    setError(null);
    setStatus("Deleting listing");

    try {
      const response = await fetch("/api/models", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id: model.id }),
      });
      const data = (await response.json()) as ModelsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete the model.");
      }

      setModels(data.models ?? []);
      setStatus("Deleted");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Delete failed.");
      setStatus("Delete failed");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#18211d]">
      <Script
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
        type="module"
      />

      <header className="border-b border-[#d9d0bd] bg-[#17251f] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-[#d7b45c] text-[#111a17]">
              HM
            </span>
            <span>Habesha Mesh Admin</span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/models"
              className="rounded-md border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10"
            >
              Public models
            </Link>
            <Link
              href="/"
              className="rounded-md border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10"
            >
              Storefront
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Uploaded models", models.length.toString()],
            ["Storage", configured ? "Connected" : "Needs setup"],
            ["Selected files", previewFile || downloadFile ? "Ready" : "Empty"],
            ["Upload size", formatBytes(totalSize)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#d5cab4] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#8d3328]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-lg border border-[#d5cab4] bg-white p-5 shadow-sm lg:sticky lg:top-5"
          >
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#8d3328]">Upload model</p>
              <h1 className="mt-1 text-3xl font-semibold">Admin publishing</h1>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Admin password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Rock-hewn church model"
                  className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 w-full rounded-md border border-[#cfc4ad] bg-white px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                >
                  <option>Architecture</option>
                  <option>Props</option>
                  <option>Environments</option>
                  <option>Kits</option>
                  <option>Characters</option>
                  <option>Materials</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Short customer-facing model description"
                  className="w-full resize-none rounded-md border border-[#cfc4ad] px-3 py-3 text-sm leading-6 outline-none ring-[#255c43] focus:ring-2"
                />
              </label>

              <UploadField
                accept={previewAccept}
                caption="GLB or GLTF"
                file={previewFile}
                label="Rotatable preview model"
                onChange={setPreviewFile}
              />

              <UploadField
                accept={downloadAccept}
                caption="ZIP, Blend, FBX, OBJ, GLB, USDZ"
                file={downloadFile}
                label="Download package"
                onChange={setDownloadFile}
              />
            </div>

            <div className="mt-5 rounded-md bg-[#f2eee4] p-3">
              <div className="flex justify-between gap-3 text-sm font-semibold">
                <span>{status}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full bg-[#255c43] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-md border border-[#e6b2aa] bg-[#fff5f2] p-3 text-sm font-medium text-[#8d3328]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isUploading}
              className="mt-5 h-11 w-full rounded-md bg-[#18211d] text-sm font-semibold text-white enabled:hover:bg-[#255c43] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isUploading ? "Uploading..." : "Publish model"}
            </button>
          </form>

          <section className="rounded-lg border border-[#d5cab4] bg-[#fffdf8] p-5 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-[#8d3328]">Live catalog</p>
                <h2 className="mt-1 text-2xl font-semibold">Uploaded 3D models</h2>
              </div>
              <button
                type="button"
                onClick={refreshModels}
                className="h-10 rounded-md border border-[#cfc4ad] bg-white px-4 text-sm font-semibold hover:border-[#255c43]"
              >
                Refresh
              </button>
            </div>

            {models.length ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {models.map((model) => (
                  <article
                    key={model.id}
                    className="overflow-hidden rounded-lg border border-[#d5cab4] bg-white shadow-sm"
                  >
                    <model-viewer
                      alt={model.title}
                      ar
                      auto-rotate
                      camera-controls
                      loading="lazy"
                      reveal="auto"
                      shadow-intensity="1"
                      src={model.modelUrl}
                      style={{ display: "block", height: "280px", width: "100%" }}
                      touch-action="pan-y"
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#8d3328]">
                            {model.category}
                          </p>
                          <h3 className="mt-1 truncate text-xl font-semibold">{model.title}</h3>
                        </div>
                        <span className="shrink-0 rounded-md bg-[#f2eee4] px-2.5 py-1 text-xs font-semibold text-[#3a453d]">
                          {model.format}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#586158]">
                        {model.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#4e574f]">
                        <span className="rounded-md border border-[#d5cab4] px-2.5 py-1">
                          {formatBytes(model.size)}
                        </span>
                        <span className="rounded-md border border-[#d5cab4] px-2.5 py-1">
                          {formatDate(model.uploadedAt)}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <a
                          href={model.downloadUrl}
                          className="flex h-10 flex-1 items-center justify-center rounded-md bg-[#255c43] text-sm font-semibold text-white hover:bg-[#1f4c39]"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => void deleteModel(model)}
                          className="h-10 rounded-md border border-[#d5cab4] px-4 text-sm font-semibold text-[#8d3328] hover:bg-[#fff5f2]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-[#cfc4ad] bg-white p-8 text-center">
                <div>
                  <p className="text-lg font-semibold">No uploaded models yet</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#586158]">
                    Published models will appear here and on the public model gallery.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function UploadField({
  accept,
  caption,
  file,
  label,
  onChange,
}: {
  accept: string;
  caption: string;
  file: File | null;
  label: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block rounded-lg border border-dashed border-[#bfb39e] bg-[#faf7ef] p-4 hover:border-[#255c43]">
      <span className="flex items-center justify-between gap-3">
        <span>
          <span className="block text-sm font-semibold">{label}</span>
          <span className="mt-1 block text-sm text-[#667066]">{caption}</span>
        </span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#255c43] text-lg font-semibold text-white">
          +
        </span>
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="sr-only"
      />
      <span className="mt-4 block min-h-12 rounded-md border border-[#e2d8c6] bg-white p-3 text-sm text-[#586158]">
        {file ? `${file.name} (${formatBytes(file.size)})` : "Select file"}
      </span>
    </label>
  );
}
