const ENGLISH_HINTS = [' the ', ' and ', 'you', 'please', 'thank', 'kind regards', 'best regards', 'dear '];
const GERMAN_HINTS = [' der ', ' die ', 'und', 'nicht', 'danke', 'vielen dank', 'mit freundlichen grüßen', 'liebe', 'hallo'];

const hasFormalAddress = (text: string) =>
  /\b(?:mr\.?|mrs\.?|ms\.?|herr|prof(?:\.|essor)?|dr\.?)\s+(?:noah\s+)?klarmann\b/i.test(text);

const extractFromLine = (text: string) => {
  const match = text.match(/^(?:from|von):\s*([^<\n]+)/im);
  if (match) {
    return match[1].replace(/['"]/g, '').trim();
  }
  return undefined;
};

const extractFromClosing = (text: string) => {
  const closingRegex =
    /(best regards|kind regards|regards|thanks|thank you|viele grüße|mit freundlichen grüßen|beste grüße|herzliche grüße|danke)[^a-zA-Z]*\n+([A-ZÄÖÜ][^\n<]+)/i;
  const match = text.match(closingRegex);
  if (match) {
    return match[2].trim();
  }
  return undefined;
};

const cleanName = (raw?: string) => {
  if (!raw) return undefined;
  return raw.replace(/["'<>]/g, '').split(/[,|]/)[0].trim();
};

const inferLastName = (fullName?: string) => {
  if (!fullName) return undefined;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return undefined;
  const last = parts[parts.length - 1];
  if (last.length < 2) {
    return undefined;
  }
  return last;
};

const detectSalutationPrefix = (text: string) => {
  if (/\b(frau|mrs\.?|ms\.?)\b/i.test(text)) {
    return 'Mrs.';
  }
  return 'Mr.';
};

export const detectLanguage = (text: string): 'de' | 'en' => {
  const lower = text.toLowerCase();
  const englishScore = ENGLISH_HINTS.reduce((score, hint) => score + (lower.includes(hint) ? 1 : 0), 0);
  const germanScore = GERMAN_HINTS.reduce((score, hint) => score + (lower.includes(hint) ? 1 : 0), 0);

  if (germanScore > englishScore) {
    return 'de';
  }
  if (englishScore > germanScore) {
    return 'en';
  }

  const umlauts = /[äöüß]/i.test(text);
  if (umlauts) {
    return 'de';
  }
  return 'en';
};

export const buildFormalSalutation = (text: string): string | undefined => {
  if (!hasFormalAddress(text)) {
    return undefined;
  }

  const fromSection = cleanName(extractFromLine(text));
  const closingSection = cleanName(extractFromClosing(text));
  const candidate = fromSection || closingSection;
  const lastName = inferLastName(candidate);
  if (!lastName) {
    return undefined;
  }
  const prefix = detectSalutationPrefix(text);
  return `${prefix} ${lastName}`;
};
