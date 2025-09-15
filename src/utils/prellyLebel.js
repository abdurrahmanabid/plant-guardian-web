// "Rice___bacterial_leaf_blight" -> "Rice Bacterial Leaf Blight"
// "Rice_bacterial_leaf_blight"   -> "Rice Bacterial Leaf Blight"
export function prettyLabel(label, { withCrop = true } = {}) {
  if (typeof label !== "string") return "";

  // Split on one-or-more underscores to handle _, __, ___ the same
  const parts = label.split(/_+/).filter(Boolean); // remove empties
  if (parts.length === 0) return "";

  const crop = parts[0];
  const diseaseParts = parts.slice(1);

  const words = withCrop ? parts : diseaseParts;

  const cap = (w) =>
    w
      .split("-")
      .map((p) => (p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : p))
      .join("-");

  return words.map(cap).join(" ");
}
