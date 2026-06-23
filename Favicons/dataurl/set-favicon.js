const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <style>
    :root { --bg: #ffffff; --fg: #111827; }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #1a1a1a; --fg: #f9fafb; }
    }
  </style>
  <rect width="32" height="32" rx="6" fill="var(--bg)"/>
  <text
    x="16" y="24"
    text-anchor="middle"
    font-family="'Arial Black', Arial, sans-serif"
    font-size="14"
    font-weight="900"
    letter-spacing="-0.5"
    fill="var(--fg)"
  >SVG</text>
</svg>`;

/**
 * Sets the favicon directly as an SVG data URL.
 * Supports prefers-color-scheme natively in the browser.
 */
function setFaviconSVG() {
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgFavicon)}`;
  applyFavicon(dataUrl, "image/svg+xml");
}

/**
 * Renders the SVG onto a canvas and sets the favicon as a PNG data URL.
 * @param {number} [size=32] - Width and height of the generated PNG in pixels.
 * @param {"light"|"dark"|"auto"} [theme="auto"] - Theme to use: "light", "dark",
 *   or "auto" (reads the browser's prefers-color-scheme).
 * @returns {Promise<void>}
 */
function setFaviconPNG(size = 32, theme = "auto") {
  return new Promise((resolve, reject) => {
    const isDark =
      theme === "dark" ||
      (theme === "auto" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Replace CSS variables with concrete colors, because
    // the canvas does not evaluate prefers-color-scheme.
    const resolvedSvg = svgFavicon
      .replace(/var\(--bg\)/g, isDark ? "#1a1a1a" : "#ffffff")
      .replace(/var\(--fg\)/g, isDark ? "#f9fafb" : "#111827");

    const blob = new Blob([resolvedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/png");
      applyFavicon(dataUrl, "image/png");
      resolve();
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Internal helper: sets the href and type of the favicon link element.
 * Creates the element if it does not exist yet.
 * @param {string} dataUrl
 * @param {string} mimeType
 */
function applyFavicon(dataUrl, mimeType) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = mimeType;
  link.href = dataUrl;
}
