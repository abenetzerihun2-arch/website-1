"use client";

/* eslint-disable @next/next/no-img-element */
import type { ChangeEvent } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";

type FileGroup = "model" | "textures" | "previews" | "docs";

type ListingDraft = {
  title: string;
  slug: string;
  category: string;
  price: string;
  license: string;
  formats: string;
  polycount: string;
  textureResolution: string;
  engine: string;
  status: string;
  description: string;
};

const initialDraft: ListingDraft = {
  title: "Rock-Hewn Church Kit",
  slug: "rock-hewn-church-kit",
  category: "Architecture",
  price: "149",
  license: "Studio",
  formats: "GLB, FBX, Blend",
  polycount: "18k tris",
  textureResolution: "4K",
  engine: "Unreal, Unity, WebGL",
  status: "Draft",
  description:
    "Modular Ethiopian-inspired stone architecture kit with clean UVs, PBR textures, and source files.",
};

const textureSlots = [
  "Base color",
  "Normal",
  "Roughness",
  "Metallic",
  "Ambient occlusion",
  "Emission",
];

const fileAccept: Record<FileGroup, string> = {
  model: ".zip,.glb,.gltf,.fbx,.obj,.blend,.usdz,.unitypackage,.uasset",
  textures: ".png,.jpg,.jpeg,.tga,.webp,.exr",
  previews: ".png,.jpg,.jpeg,.webp,.mp4,.webm",
  docs: ".txt,.pdf,.md",
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileListToArray(files: FileList | null) {
  return files ? Array.from(files) : [];
}

export default function AdminPage() {
  const [draft, setDraft] = useState<ListingDraft>(initialDraft);
  const [modelFiles, setModelFiles] = useState<File[]>([]);
  const [textureFiles, setTextureFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("Base color");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const allFiles = [...modelFiles, ...textureFiles, ...previewFiles, ...docFiles];
  const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

  const checks = useMemo(
    () => [
      {
        label: "Model package attached",
        done: modelFiles.some((file) => /\.(zip|glb|gltf|fbx|blend|obj|usdz)$/i.test(file.name)),
      },
      {
        label: "Texture maps attached",
        done: textureFiles.length >= 3,
      },
      {
        label: "Preview media attached",
        done: previewFiles.length >= 2,
      },
      {
        label: "Price and license set",
        done: Number(draft.price) > 0 && draft.license.length > 0,
      },
      {
        label: "Description ready",
        done: draft.description.trim().length >= 80,
      },
    ],
    [draft.description, draft.license, draft.price, modelFiles, previewFiles, textureFiles],
  );

  const readyCount = checks.filter((check) => check.done).length;
  const canPublish = readyCount === checks.length;

  function updateDraft(field: keyof ListingDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleFiles(group: FileGroup, event: ChangeEvent<HTMLInputElement>) {
    const files = fileListToArray(event.target.files);
    if (group === "model") setModelFiles(files);
    if (group === "textures") setTextureFiles(files);
    if (group === "previews") setPreviewFiles(files);
    if (group === "docs") setDocFiles(files);
  }

  function saveDraft() {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#18211d]">
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
              href="/"
              className="rounded-md border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10"
            >
              Storefront
            </Link>
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-md bg-[#d7b45c] px-4 py-2 font-semibold text-[#111a17] hover:bg-[#e3c66c]"
            >
              + Save draft
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Listings", "5 active"],
            ["Draft status", savedAt ? `Saved ${savedAt}` : "Unsaved"],
            ["Package size", formatBytes(totalSize)],
            ["Readiness", `${readyCount}/${checks.length}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#d5cab4] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#8d3328]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-[#d5cab4] bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold text-[#8d3328]">Listing details</p>
                  <h1 className="mt-1 text-3xl font-semibold">New 3D asset listing</h1>
                </div>
                <select
                  value={draft.status}
                  onChange={(event) => updateDraft("status", event.target.value)}
                  className="h-11 rounded-md border border-[#cfc4ad] bg-white px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                >
                  <option>Draft</option>
                  <option>Review</option>
                  <option>Published</option>
                  <option>Archived</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold">Title</span>
                  <input
                    value={draft.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">Slug</span>
                  <input
                    value={draft.slug}
                    onChange={(event) => updateDraft("slug", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">Category</span>
                  <select
                    value={draft.category}
                    onChange={(event) => updateDraft("category", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] bg-white px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  >
                    <option>Architecture</option>
                    <option>Props</option>
                    <option>Environments</option>
                    <option>Kits</option>
                    <option>Materials</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">Price USD</span>
                  <input
                    value={draft.price}
                    inputMode="decimal"
                    onChange={(event) => updateDraft("price", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">License</span>
                  <select
                    value={draft.license}
                    onChange={(event) => updateDraft("license", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] bg-white px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  >
                    <option>Indie</option>
                    <option>Studio</option>
                    <option>Enterprise</option>
                    <option>Exclusive buyout</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">Formats</span>
                  <input
                    value={draft.formats}
                    onChange={(event) => updateDraft("formats", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">Polycount</span>
                  <input
                    value={draft.polycount}
                    onChange={(event) => updateDraft("polycount", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold">Texture resolution</span>
                  <input
                    value={draft.textureResolution}
                    onChange={(event) => updateDraft("textureResolution", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold">Target engines</span>
                  <input
                    value={draft.engine}
                    onChange={(event) => updateDraft("engine", event.target.value)}
                    className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold">Description</span>
                  <textarea
                    value={draft.description}
                    onChange={(event) => updateDraft("description", event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-md border border-[#cfc4ad] px-3 py-3 text-sm leading-6 outline-none ring-[#255c43] focus:ring-2"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-[#d5cab4] bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold text-[#8d3328]">Upload package</p>
                  <h2 className="mt-1 text-2xl font-semibold">Files and texture maps</h2>
                </div>
                <select
                  value={selectedSlot}
                  onChange={(event) => setSelectedSlot(event.target.value)}
                  className="h-11 rounded-md border border-[#cfc4ad] bg-white px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
                >
                  {textureSlots.map((slot) => (
                    <option key={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <UploadBox
                  title="Model package"
                  caption="ZIP, GLB, FBX, Blend, OBJ, USDZ"
                  accept={fileAccept.model}
                  files={modelFiles}
                  onChange={(event) => handleFiles("model", event)}
                />
                <UploadBox
                  title={`${selectedSlot} textures`}
                  caption="PNG, JPG, TGA, WebP, EXR"
                  accept={fileAccept.textures}
                  files={textureFiles}
                  multiple
                  onChange={(event) => handleFiles("textures", event)}
                />
                <UploadBox
                  title="Preview renders"
                  caption="Images or short turntable videos"
                  accept={fileAccept.previews}
                  files={previewFiles}
                  multiple
                  onChange={(event) => handleFiles("previews", event)}
                />
                <UploadBox
                  title="Documentation"
                  caption="README, license, setup notes"
                  accept={fileAccept.docs}
                  files={docFiles}
                  multiple
                  onChange={(event) => handleFiles("docs", event)}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-[#d5cab4] bg-[#fffdf8] p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#8d3328]">Marketplace preview</p>
              <div className="mt-4 overflow-hidden rounded-lg border border-[#d5cab4] bg-white">
                <div className="aspect-[5/4] bg-[#15251f]">
                  <img
                    src="/assets/asset-rock-church.png"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#8d3328]">{draft.category}</p>
                      <h2 className="mt-1 text-xl font-semibold">{draft.title || "Untitled asset"}</h2>
                    </div>
                    <p className="text-lg font-semibold text-[#255c43]">
                      ${Number(draft.price || 0).toLocaleString("en-US")}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#586158]">{draft.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[draft.formats, draft.polycount, draft.textureResolution, draft.license]
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[#d5cab4] px-2.5 py-1 text-xs font-semibold text-[#4e574f]"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#d5cab4] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#8d3328]">Readiness</p>
                  <h2 className="mt-1 text-2xl font-semibold">{readyCount}/{checks.length} complete</h2>
                </div>
                <span
                  className={`rounded-md px-3 py-1 text-sm font-semibold ${
                    canPublish ? "bg-[#255c43] text-white" : "bg-[#f2eee4] text-[#586158]"
                  }`}
                >
                  {canPublish ? "Ready" : "Draft"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {checks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-3 rounded-md border border-[#e2d8c6] p-3"
                  >
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-md text-sm font-semibold ${
                        check.done ? "bg-[#255c43] text-white" : "bg-[#f2eee4] text-[#586158]"
                      }`}
                    >
                      {check.done ? "OK" : "!"}
                    </span>
                    <p className="text-sm font-medium">{check.label}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={!canPublish}
                className="mt-5 h-11 w-full rounded-md bg-[#18211d] text-sm font-semibold text-white enabled:hover:bg-[#255c43] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Publish listing
              </button>
            </section>

            <section className="rounded-lg border border-[#d5cab4] bg-[#17251f] p-5 text-white shadow-sm">
              <p className="text-sm font-semibold text-[#d7b45c]">Package manifest</p>
              <div className="mt-4 space-y-3">
                {allFiles.length ? (
                  allFiles.slice(0, 8).map((file) => (
                    <div key={`${file.name}-${file.size}`} className="flex justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">{file.name}</span>
                      <span className="shrink-0 text-white/65">{formatBytes(file.size)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-white/70">No files selected.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function UploadBox({
  title,
  caption,
  accept,
  files,
  multiple = false,
  onChange,
}: {
  title: string;
  caption: string;
  accept: string;
  files: File[];
  multiple?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block rounded-lg border border-dashed border-[#bfb39e] bg-[#faf7ef] p-4 hover:border-[#255c43]">
      <span className="flex items-center justify-between gap-3">
        <span>
          <span className="block text-sm font-semibold">{title}</span>
          <span className="mt-1 block text-sm text-[#667066]">{caption}</span>
        </span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#255c43] text-lg font-semibold text-white">
          +
        </span>
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="sr-only"
      />
      <span className="mt-4 block rounded-md border border-[#e2d8c6] bg-white p-3 text-sm text-[#586158]">
        {files.length
          ? files.map((file) => file.name).join(", ")
          : "Select files"}
      </span>
    </label>
  );
}
