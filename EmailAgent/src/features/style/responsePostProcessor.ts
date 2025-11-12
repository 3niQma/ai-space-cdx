const DEFAULT_CLOSINGS = [
  'Beste Grüße',
  'Viele Grüße',
  'Liebe Grüße',
  'Mit freundlichen Grüßen',
  'Herzliche Grüße',
  'Danke und viele Grüße',
  'Danke, viele Grüße',
  'Best regards',
  'Kind regards',
  'Regards',
  'Cheers',
];

const normalize = (value: string) => value.trim().toLowerCase();

const matchesClosing = (line: string, closingVariants: string[]) => {
  const normalizedLine = normalize(line);
  return closingVariants.some((closing) => normalizedLine.startsWith(closing));
};

export const polishResponseText = (text: string, extraClosings: string[] = []) => {
  if (!text.trim()) {
    return text;
  }

  const closingVariants = Array.from(
    new Set([...extraClosings, ...DEFAULT_CLOSINGS].filter(Boolean).map((entry) => normalize(entry))),
  );

  const lines = text.split('\n');
  let cutoffIndex = -1;

  lines.forEach((line, index) => {
    if (matchesClosing(line, closingVariants)) {
      cutoffIndex = index;
    }
  });

  if (cutoffIndex === -1) {
    return text.trim();
  }

  return lines
    .slice(0, cutoffIndex + 1)
    .join('\n')
    .trim();
};
