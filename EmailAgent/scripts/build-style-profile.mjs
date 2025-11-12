#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { listMarkdownFiles, parseEmailFile, sanitizeBody } from './utils/email-utils.mjs';
import { classifyEmail, getPronounStats } from './utils/style-classifier.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const DEFAULT_EMAIL_DIR = path.resolve(projectRoot, '../../EmailsAnonymize/EmailsAnonymous_anonymized');
const OUTPUT_PATH = path.resolve(projectRoot, 'src/features/style/styleProfiles.json');

const args = parseArgs(process.argv.slice(2));
const emailsDir = path.resolve(args.input ?? DEFAULT_EMAIL_DIR);
const limit = args.limit ? Number(args.limit) : undefined;

const GREETING_REGEX = /^(hallo|hi|hey|liebe|lieber|liebes|guten|moin|servus|dear|hello)\b/i;
const CLOSING_REGEX =
  /\b(viele grüße|vielen dank|beste grüße|best regards|kind regards|cheers|lg|liebe grüße|herzliche grüße)\b/i;
const EMOJI_REGEX =
  /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/gu;

const CATEGORY_KEYS = ['students', 'colleagues', 'industry'];

const categoryStats = CATEGORY_KEYS.reduce((acc, key) => {
  acc[key] = {
    totalEmails: 0,
    totalWords: 0,
    totalSentences: 0,
    informalPronouns: 0,
    formalPronouns: 0,
    emojiCount: 0,
    exclamationCount: 0,
    greetings: new Map(),
    closings: new Map(),
    signatures: new Map(),
    exemplarSubjects: [],
  };
  return acc;
}, {});

async function main() {
  const files = await listMarkdownFiles(emailsDir);
  let processed = 0;

  for (const file of files) {
    if (limit && processed >= limit) {
      break;
    }

    const email = await parseEmailFile(file);
    if (!email) {
      continue;
    }

    if (!email.from?.toLowerCase().includes('klarmann')) {
      continue;
    }

    const category = classifyEmail(email);
    if (!category) {
      continue;
    }

    const stats = categoryStats[category];
    processed += 1;
    stats.totalEmails += 1;

    const cleanBody = email.sanitizedBody ?? sanitizeBody(email.body ?? '');
    const words = tokenizeWords(cleanBody);
    const sentences = splitSentences(cleanBody);

    stats.totalWords += words.length;
    stats.totalSentences += Math.max(1, sentences.length);
    const pronounStats = getPronounStats(cleanBody);
    stats.informalPronouns += pronounStats.informal;
    stats.formalPronouns += pronounStats.formal;
    stats.emojiCount += matchCount(cleanBody, EMOJI_REGEX);
    stats.exclamationCount += (cleanBody.match(/!/g) ?? []).length;

    const greeting = detectGreeting(cleanBody);
    const closing = detectClosing(cleanBody);
    const signature = detectSignature(cleanBody);

    if (greeting) {
      incrementCount(stats.greetings, greeting);
    }

    if (closing) {
      incrementCount(stats.closings, closing);
    }

    if (signature) {
      incrementCount(stats.signatures, signature);
    }

    if (stats.exemplarSubjects.length < 5 && email.subject) {
      stats.exemplarSubjects.push(email.subject);
    }
  }

  await writeStyleProfile(categoryStats, processed);
  console.log(`Processed ${processed} emails. Style profile written to ${path.relative(projectRoot, OUTPUT_PATH)}.`);
}

function tokenizeWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zäöüß0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function splitSentences(text) {
  return text
    .split(/[\.\!\?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function detectGreeting(text) {
  const lines = text.split('\n').map((line) => line.trim());
  for (let i = 0; i < Math.min(lines.length, 6); i += 1) {
    const line = lines[i];
    if (!line) {
      continue;
    }
    if (line.length > 80) {
      continue;
    }
    if (GREETING_REGEX.test(line)) {
      return normalizeCase(line.split(/[,\!]/)[0]);
    }
  }
  return undefined;
}

function detectClosing(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (/^(an|from|to|cc|betreff|subject|gesendet)\b/i.test(line)) {
      continue;
    }
    if (line.length > 80) {
      continue;
    }
    if (CLOSING_REGEX.test(line)) {
      return normalizeCase(line);
    }
    if (line.length > 120) {
      continue;
    }
    if (lines.length - i > 5) {
      break;
    }
  }
  return undefined;
}

function detectSignature(text) {
  const lines = text.split('\n').map((line) => line.trim());
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (!line) {
      continue;
    }
    if (/^(an|from|to|cc|betreff|subject|gesendet)\b/i.test(line)) {
      continue;
    }
    if (line.toLowerCase().includes('noah') || /prof\.?.*klarmann/i.test(line)) {
      return normalizeCase(line);
    }
    if (lines.length - i > 6) {
      break;
    }
  }
  return undefined;
}

function matchCount(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function incrementCount(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function normalizeCase(str) {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseArgs(rawArgs) {
  const result = {};
  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];
    if (!arg.startsWith('--')) {
      continue;
    }
    const eqIndex = arg.indexOf('=');
    if (eqIndex !== -1) {
      const key = arg.slice(2, eqIndex);
      result[key] = arg.slice(eqIndex + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = rawArgs[i + 1];
    if (next && !next.startsWith('--')) {
      result[key] = next;
      i += 1;
    } else {
      result[key] = true;
    }
  }
  return result;
}

async function writeStyleProfile(statsByCategory, processed) {
  const profile = {
    generatedAt: new Date().toISOString(),
    emailSampleSize: processed,
    categories: {},
  };

  for (const [category, stats] of Object.entries(statsByCategory)) {
    if (stats.totalEmails === 0) {
      continue;
    }
    profile.categories[category] = {
      totalEmails: stats.totalEmails,
      avgWords: round(stats.totalWords / stats.totalEmails),
      avgSentenceLength: round(stats.totalWords / stats.totalSentences),
      informalPronounRate: round(stats.informalPronouns / stats.totalEmails),
      formalPronounRate: round(stats.formalPronouns / stats.totalEmails),
      emojiRate: round(stats.emojiCount / stats.totalEmails),
      exclamationRate: round(stats.exclamationCount / stats.totalEmails),
      topGreetings: topEntries(stats.greetings),
      topClosings: topEntries(stats.closings),
      topSignatures: topEntries(stats.signatures),
      exemplarSubjects: stats.exemplarSubjects,
    };
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(profile, null, 2));
}

function topEntries(map, limitEntries = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limitEntries)
    .map(([text, count]) => ({ text, count }));
}

function round(value) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

main().catch((error) => {
  console.error('Failed to build style profile:', error);
  process.exitCode = 1;
});
