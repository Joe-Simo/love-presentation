export type LoveMetrics = {
  compatibility: string;
  badJokeTolerance: string;
  snackAlignment: string;
  cuteRisk: "Elevated" | "Severe" | "Uninsurable";
  biasWarning: "Moderate" | "Severe" | "Legally Compromised";
  leavingRecommendation: "Denied" | "Strongly Denied" | "Denied With Snacks";
};

export function createLoveMetrics(senderName: string, recipientName: string) {
  const input = `${senderName.trim().toLowerCase()}:${recipientName
    .trim()
    .toLowerCase()}`;

  return {
    compatibility: seededScore(`${input}:compatibility`, 88, 99).toFixed(1),
    badJokeTolerance: seededScore(`${input}:bad-jokes`, 82, 98).toFixed(0),
    snackAlignment: seededScore(`${input}:snacks`, 84, 99).toFixed(0),
    cuteRisk: pickFromSeed(`${input}:risk`, [
      "Elevated",
      "Severe",
      "Uninsurable",
    ]),
    biasWarning: pickFromSeed(`${input}:bias`, [
      "Moderate",
      "Severe",
      "Legally Compromised",
    ]),
    leavingRecommendation: pickFromSeed(`${input}:leaving`, [
      "Denied",
      "Strongly Denied",
      "Denied With Snacks",
    ]),
  } satisfies LoveMetrics;
}

export function seededScore(input: string, min = 82, max = 99) {
  const range = Math.max(0, Math.round((max - min) * 10));
  return min + (hashString(input) % (range + 1)) / 10;
}

function pickFromSeed<const Value extends string>(
  input: string,
  values: readonly Value[],
) {
  return values[hashString(input) % values.length] as Value;
}

function hashString(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
