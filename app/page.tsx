"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useMemo, useState } from "react";

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  src: string;
  alt: string;
  description: string;
  formats: string[];
  tags: string[];
  polycount: string;
  delivery: string;
};

const categories = ["All", "Architecture", "Props", "Environments", "Kits"];

const products: Product[] = [
  {
    id: "lalibela-kit",
    title: "Rock-Hewn Church Kit",
    category: "Architecture",
    price: 149,
    src: "/assets/asset-rock-church.png",
    alt: "Stylized 3D render of an Ethiopian rock-hewn church asset kit",
    description:
      "Modular stone walls, carved portals, cross motifs, and weathered PBR surfaces for heritage-inspired scenes.",
    formats: ["GLB", "FBX", "USDZ"],
    tags: ["PBR", "Modular", "4K maps"],
    polycount: "18k tris",
    delivery: "48h custom pass",
  },
  {
    id: "jebena-prop",
    title: "Jebena Coffee Prop",
    category: "Props",
    price: 54,
    src: "/assets/asset-jebena.png",
    alt: "Stylized 3D render of an Ethiopian jebena coffee pot asset",
    description:
      "Clay vessel model with clean topology, colorway variants, and game-ready roughness and normal maps.",
    formats: ["GLB", "FBX", "Blend"],
    tags: ["Hero prop", "Retopo", "LOD set"],
    polycount: "6k tris",
    delivery: "24h edits",
  },
  {
    id: "mesob-table",
    title: "Mesob Woven Table",
    category: "Props",
    price: 72,
    src: "/assets/asset-mesob.png",
    alt: "Stylized 3D render of a woven Ethiopian mesob table asset",
    description:
      "Basket-weave geometry, patterned material slots, and optimized textures for close camera product shots.",
    formats: ["GLB", "FBX", "OBJ"],
    tags: ["Woven shader", "UV packed", "LOD set"],
    polycount: "9k tris",
    delivery: "36h custom pass",
  },
  {
    id: "door-ornaments",
    title: "Carved Door Ornament Set",
    category: "Kits",
    price: 96,
    src: "/assets/asset-ornament-kit.png",
    alt: "Stylized 3D render of carved Ethiopian door ornament assets",
    description:
      "Three carved panels with trim meshes, brass inlays, masks, and swappable wood stain materials.",
    formats: ["GLB", "FBX", "Unreal"],
    tags: ["Kitbash", "Trim sheet", "Nanite ready"],
    polycount: "14k tris",
    delivery: "48h edits",
  },
  {
    id: "highland-terrain",
    title: "Highland Terrain Tile Pack",
    category: "Environments",
    price: 128,
    src: "/assets/asset-terrain-pack.png",
    alt: "Stylized 3D render of an Ethiopian highland terrain tile with acacia form",
    description:
      "Seamless terrain pieces with Rift Valley color grading, scatter masks, and Unity or Unreal presets.",
    formats: ["GLB", "Unity", "Unreal"],
    tags: ["Tileable", "Scatter masks", "Engine presets"],
    polycount: "22k tris",
    delivery: "72h custom pass",
  },
];

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<string[]>(["lalibela-kit"]);
  const [license, setLicense] = useState("Studio");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const searchable = [
        product.title,
        product.category,
        product.description,
        ...product.formats,
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchable.includes(normalizedQuery);
    });
  }, [activeCategory, query]);

  const cartProducts = products.filter((product) => cart.includes(product.id));
  const cartTotal = cartProducts.reduce((sum, product) => sum + product.price, 0);
  const licenseMultiplier = license === "Enterprise" ? 1.85 : license === "Studio" ? 1.25 : 1;
  const quotedTotal = Math.round(cartTotal * licenseMultiplier);

  function toggleCart(productId: string) {
    setCart((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#18211d]">
      <section
        className="relative min-h-[84vh] overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(10, 18, 15, 0.96) 0%, rgba(10, 18, 15, 0.88) 36%, rgba(10, 18, 15, 0.25) 72%), url('/assets/hero-assets.png')",
        }}
      >
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#market" className="flex items-center gap-3 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-[#d7b45c]/70 bg-[#d7b45c] text-[#111a17]">
              HM
            </span>
            <span>Habesha Mesh</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-white/78 md:flex">
            <a className="hover:text-white" href="#market">
              Assets
            </a>
            <Link className="hover:text-white" href="/models">
              3D Models
            </Link>
            <a className="hover:text-white" href="#custom">
              Custom work
            </a>
            <a className="hover:text-white" href="#pipeline">
              Pipeline
            </a>
            <Link className="hover:text-white" href="/admin">
              Admin
            </Link>
          </nav>
          <a
            href="#quote"
            className="rounded-md border border-white/28 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
          >
            Quote cart {cart.length}
          </a>
        </header>

        <div className="mx-auto flex max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold text-[#d7b45c]">
              Premium cultural environment assets
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Custom Ethiopian 3D Model Assets
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Buy game-ready Ethiopian architectural kits, props, and environment
              packs, or commission accurate custom models for films, games, AR,
              museums, and product visualization.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#market"
                className="rounded-md bg-[#d7b45c] px-5 py-3 text-sm font-semibold text-[#111a17] hover:bg-[#e3c66c]"
              >
                Browse assets
              </a>
              <Link
                href="/models"
                className="rounded-md border border-white/28 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Uploaded models
              </Link>
              <a
                href="#custom"
                className="rounded-md border border-white/28 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Start custom brief
              </a>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["38", "source files"],
                ["4K", "texture sets"],
                ["72h", "custom options"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-l border-[#d7b45c]/50 bg-black/10 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-3xl font-semibold text-[#d7b45c]">{value}</p>
                  <p className="mt-1 text-sm text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9d0bd] bg-[#f7f4ec]">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 sm:px-8 md:grid-cols-4">
          {[
            "GLB, FBX, USDZ, Unity, Unreal",
            "PBR textures with named material slots",
            "Commercial license and custom buyouts",
            "Cultural review available on request",
          ].map((item) => (
            <p key={item} className="text-sm font-medium text-[#3a453d]">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section id="market" className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#8d3328]">Asset catalog</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
              Ready-to-license Ethiopian 3D assets
            </h2>
          </div>
          <label className="w-full max-w-md">
            <span className="mb-2 block text-sm font-medium text-[#4d574f]">
              Search assets
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try GLB, woven, terrain, Unreal"
              className="h-12 w-full rounded-md border border-[#cfc4ad] bg-white px-4 text-sm outline-none ring-[#255c43] focus:ring-2"
            />
          </label>
        </div>

        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Asset categories">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-md border px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? "border-[#255c43] bg-[#255c43] text-white"
                    : "border-[#cfc4ad] bg-white text-[#3a453d] hover:border-[#255c43]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5 md:grid-cols-2">
            {filteredProducts.map((product) => {
              const isSelected = cart.includes(product.id);
              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-lg border border-[#d5cab4] bg-white shadow-sm"
                >
                  <div className="aspect-[5/4] bg-[#15251f]">
                    <img
                      src={product.src}
                      alt={product.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#8d3328]">
                          {product.category}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold">{product.title}</h3>
                      </div>
                      <p className="shrink-0 text-xl font-semibold text-[#255c43]">
                        {formatCurrency.format(product.price)}
                      </p>
                    </div>
                    <p className="mt-3 min-h-20 text-sm leading-6 text-[#586158]">
                      {product.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md bg-[#f2eee4] p-3">
                        <p className="font-semibold">{product.polycount}</p>
                        <p className="mt-1 text-[#667066]">optimized geometry</p>
                      </div>
                      <div className="rounded-md bg-[#f2eee4] p-3">
                        <p className="font-semibold">{product.delivery}</p>
                        <p className="mt-1 text-[#667066]">for paid edits</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {[...product.formats, ...product.tags].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[#d5cab4] px-2.5 py-1 text-xs font-medium text-[#4e574f]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCart(product.id)}
                      className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold ${
                        isSelected
                          ? "bg-[#8d3328] text-white hover:bg-[#782b23]"
                          : "bg-[#18211d] text-white hover:bg-[#255c43]"
                      }`}
                    >
                      <span aria-hidden="true">{isSelected ? "-" : "+"}</span>
                      {isSelected ? "Remove from quote" : "Add to quote"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside
            id="quote"
            className="h-fit rounded-lg border border-[#d5cab4] bg-[#fffdf8] p-5 shadow-sm lg:sticky lg:top-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#8d3328]">Quote cart</p>
                <h2 className="mt-1 text-2xl font-semibold">Build a package</h2>
              </div>
              <span className="rounded-md bg-[#255c43] px-3 py-1 text-sm font-semibold text-white">
                {cart.length} item{cart.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {cartProducts.length ? (
                cartProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-md border border-[#e2d8c6] bg-white p-3"
                  >
                    <img
                      src={product.src}
                      alt=""
                      className="h-14 w-16 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{product.title}</p>
                      <p className="text-sm text-[#6d756c]">
                        {formatCurrency.format(product.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCart(product.id)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-[#d5cab4] text-lg leading-none text-[#8d3328] hover:bg-[#f6ebe8]"
                      aria-label={`Remove ${product.title}`}
                    >
                      -
                    </button>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-[#cfc4ad] p-4 text-sm leading-6 text-[#586158]">
                  Add assets to estimate a license package.
                </p>
              )}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-[#3a453d]">
                License
              </span>
              <select
                value={license}
                onChange={(event) => setLicense(event.target.value)}
                className="h-11 w-full rounded-md border border-[#cfc4ad] bg-white px-3 text-sm outline-none ring-[#255c43] focus:ring-2"
              >
                <option>Indie</option>
                <option>Studio</option>
                <option>Enterprise</option>
              </select>
            </label>

            <div className="mt-5 rounded-md bg-[#18211d] p-4 text-white">
              <div className="flex justify-between text-sm text-white/72">
                <span>Estimated package</span>
                <span>{license} license</span>
              </div>
              <p className="mt-2 text-3xl font-semibold">
                {formatCurrency.format(quotedTotal)}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Final quote includes usage scope, file formats, and any custom
                texture or topology work.
              </p>
            </div>

            <a
              href="mailto:studio@habeshamesh.example?subject=Ethiopian%203D%20asset%20quote"
              className="mt-5 flex h-11 w-full items-center justify-center rounded-md bg-[#d7b45c] text-sm font-semibold text-[#111a17] hover:bg-[#e3c66c]"
            >
              Request quote
            </a>
          </aside>
        </div>
      </section>

      <section id="custom" className="bg-[#17251f] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold text-[#d7b45c]">Custom production</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Commission Ethiopian assets from references, sketches, or scans
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/75">
              Send the target platform, visual references, scale needs, and
              cultural context. The studio returns blockout previews, topology
              options, texture sheets, and packaged source files.
            </p>

            <div id="pipeline" className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Reference audit"],
                ["02", "Blockout preview"],
                ["03", "Final source delivery"],
              ].map(([step, label]) => (
                <div key={step} className="border-t border-[#d7b45c]/45 pt-3">
                  <p className="text-sm font-semibold text-[#d7b45c]">{step}</p>
                  <p className="mt-2 text-sm text-white/78">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-lg border border-white/15 bg-white p-5 text-[#18211d] shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold">Asset type</span>
                <select className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2">
                  <option>Architecture kit</option>
                  <option>Hero prop</option>
                  <option>Environment pack</option>
                  <option>Character accessory</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Target engine</span>
                <select className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2">
                  <option>Unreal Engine</option>
                  <option>Unity</option>
                  <option>WebGL or Three.js</option>
                  <option>Film or Blender</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Budget range</span>
                <select className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2">
                  <option>$300 to $900</option>
                  <option>$900 to $2,500</option>
                  <option>$2,500 to $7,500</option>
                  <option>Production retainer</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Delivery speed</span>
                <select className="h-11 w-full rounded-md border border-[#cfc4ad] px-3 text-sm outline-none ring-[#255c43] focus:ring-2">
                  <option>Standard</option>
                  <option>Rush review</option>
                  <option>Milestone schedule</option>
                </select>
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Deliverables</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {["Clean source file", "PBR texture set", "LOD variants", "Engine import preset"].map(
                  (item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 rounded-md border border-[#d5cab4] p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 accent-[#255c43]"
                      />
                      {item}
                    </label>
                  ),
                )}
              </div>
            </fieldset>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold">Project note</span>
              <textarea
                rows={4}
                placeholder="Example: museum AR scene, low-poly WebGL target, references for Aksumite window geometry"
                className="w-full resize-none rounded-md border border-[#cfc4ad] px-3 py-3 text-sm outline-none ring-[#255c43] focus:ring-2"
              />
            </label>

            <a
              href="mailto:studio@habeshamesh.example?subject=Custom%20Ethiopian%203D%20asset%20brief"
              className="mt-5 flex h-11 w-full items-center justify-center rounded-md bg-[#18211d] text-sm font-semibold text-white hover:bg-[#255c43]"
            >
              Send custom brief
            </a>
          </form>
        </div>
      </section>

      <footer className="bg-[#f7f4ec] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 border-t border-[#d9d0bd] pt-6 text-sm text-[#586158] sm:flex-row">
          <p>Habesha Mesh, Ethiopian 3D assets for real-time and cinematic work.</p>
          <div className="flex flex-wrap gap-4">
            <Link className="font-semibold text-[#255c43] hover:text-[#18211d]" href="/models">
              Uploaded model gallery
            </Link>
            <Link className="font-semibold text-[#255c43] hover:text-[#18211d]" href="/admin">
              Admin listing manager
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
