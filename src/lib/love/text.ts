export function firstGrapheme(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "?";
  }

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    const [first] = segmenter.segment(trimmed);

    return first?.segment.toLocaleUpperCase() ?? "?";
  }

  return Array.from(trimmed)[0]?.toLocaleUpperCase() ?? "?";
}
