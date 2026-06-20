// ── Reusable illustration component ────────────────────────────────────────
// Renders the purple-themed EdTech illustrations consistently across the app.
//
// - Uses <picture> to serve a lightweight .webp with a .png fallback.
// - Lazy-loads by default (everything except the above-the-fold hero image).
// - object-contain only — never crops or distorts the artwork.
// - Optional "float" or "scale" animation for subtle motion.
//
// Usage:
//   <Illustration src={heroLearning} alt="Student learning online" size="hero" animate="float" />

const SIZE_CLASSES = {
    // Image 1 — landing page hero
    hero: "w-[280px] sm:w-[380px] md:w-[450px] lg:w-[500px] max-w-full",
    // Image 2 — course discovery
    discovery: "w-[220px] sm:w-[300px] md:w-[360px] max-w-full",
    // Image 3 — certificates / achievements
    achievement: "w-[220px] sm:w-[300px] md:w-[380px] max-w-full",
    // Image 4 — student dashboard / active learning
    dashboard: "w-[260px] sm:w-[350px] md:w-[420px] max-w-full",
};

const ANIMATION_CLASSES = {
    float: "animate-float",
    scale: "transition-transform duration-300 ease-out hover:scale-[1.04]",
    none: "",
};

export default function Illustration({
    src,
    webp,
    alt,
    size = "discovery",
    animate = "none",
    eager = false,
    framed = false,
    blend = true,
    className = "",
}) {
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.discovery;
    const animClass = ANIMATION_CLASSES[animate] || "";

    // Feathers the image's own rectangular canvas edges so it dissolves into
    // whatever background sits behind it, instead of reading as a pasted card.
    const blendClass = blend && !framed ? "illustration-blend" : "";

    const isWrapped = framed || blend;

    const picture = (
        <picture className={`block select-none relative z-10 w-full ${isWrapped ? "" : `${sizeClass} ${className}`}`}>
            {webp && <source srcSet={webp} type="image/webp" />}
            <img
                src={src}
                alt={alt}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className={`w-full h-auto object-contain ${animClass} ${blendClass}`}
            />
        </picture>
    );

    // "framed" wraps the illustration in a soft white card — used when the
    // illustration sits on top of a colored/gradient surface, so its own
    // light background reads as an intentional layered card rather than a clash.
    if (framed) {
        return (
            <div className={`bg-white/95 rounded-card shadow-soft p-3 sm:p-4 ${sizeClass} ${className}`}>
                {picture}
            </div>
        );
    }

    // Soft color glow behind the feathered illustration — echoes the blurred
    // decorative blobs already used elsewhere (e.g. the landing hero), so the
    // illustration reads as part of the page's ambient background rather than
    // a flat sticker placed on top of it.
    if (blend) {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-90" aria-hidden="true" />
                {picture}
            </div>
        );
    }

    return picture;
}