"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { formatBytes, type ModelListing } from "@/lib/model-store";

type ModelsResponse = {
  configured?: boolean;
  message?: string;
  models?: ModelListing[];
  error?: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently uploaded";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelListing[]>([]);
  const [message, setMessage] = useState("Loading models");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const response = await fetch("/api/models", { cache: "no-store" });
        const data = (await response.json()) as ModelsResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load models.");
        }

        setModels(data.models ?? []);
        setMessage(data.message ?? "");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load models.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadModels();
  }, []);

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
            <span>Habesha Mesh</span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10"
            >
              Storefront
            </Link>
            <Link
              href="/admin"
              className="rounded-md bg-[#d7b45c] px-4 py-2 font-semibold text-[#111a17] hover:bg-[#e3c66c]"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#8d3328]">Live model gallery</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
              Rotate and download Ethiopian 3D models
            </h1>
          </div>
          <Link
            href="/admin"
            className="h-11 rounded-md border border-[#cfc4ad] bg-white px-4 py-3 text-center text-sm font-semibold hover:border-[#255c43]"
          >
            Upload from admin
          </Link>
        </div>

        {message && !models.length ? (
          <p className="mb-5 rounded-md border border-[#d5cab4] bg-white p-4 text-sm font-medium text-[#586158]">
            {message}
          </p>
        ) : null}

        {models.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                  style={{ display: "block", height: "320px", width: "100%" }}
                  touch-action="pan-y"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#8d3328]">{model.category}</p>
                      <h2 className="mt-1 text-xl font-semibold">{model.title}</h2>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#f2eee4] px-2.5 py-1 text-xs font-semibold text-[#3a453d]">
                      {model.format}
                    </span>
                  </div>
                  <p className="mt-3 min-h-24 text-sm leading-6 text-[#586158]">
                    {model.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#4e574f]">
                    <span className="rounded-md border border-[#d5cab4] px-2.5 py-1">
                      {formatBytes(model.size)}
                    </span>
                    <span className="rounded-md border border-[#d5cab4] px-2.5 py-1">
                      {formatDate(model.uploadedAt)}
                    </span>
                    {model.downloadFileName ? (
                      <span className="rounded-md border border-[#d5cab4] px-2.5 py-1">
                        {model.downloadFileName}
                      </span>
                    ) : null}
                  </div>
                  <a
                    href={model.downloadUrl}
                    className="mt-5 flex h-11 w-full items-center justify-center rounded-md bg-[#255c43] text-sm font-semibold text-white hover:bg-[#1f4c39]"
                  >
                    Download model
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-96 place-items-center rounded-lg border border-dashed border-[#cfc4ad] bg-white p-8 text-center">
            <div>
              <p className="text-xl font-semibold">
                {isLoading ? "Loading uploaded models" : "No uploaded models yet"}
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#586158]">
                Once a model is published from the admin page, it will appear in this gallery.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
