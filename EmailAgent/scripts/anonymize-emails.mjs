#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const args = parseArgs(process.argv.slice(2));
const inputDir = path.resolve(args.input ?? path.join(repoRoot, '../../EmailsAnonymize/EmailsAnonymous'));
const outputDir = path.resolve(args.output ?? path.join(repoRoot, '../../EmailsAnonymize/EmailsAnonymous_anonymized'));

const connectors = [
  'al',
  'bin',
  'da',
  'dal',
  'das',
  'de',
  'del',
  'della',
  'den',
  'der',
  'di',
  'dos',
  'du',
  'el',
  'ibn',
  'la',
  'le',
  "o'",
  'st.',
  'st',
  'ter',
  'van',
  'von',
];

const blockedFirstWords = new Set([
  'a',
  'an',
  'beste',
  'dear',
  'der',
  'des',
  'die',
  'das',
  'den',
  'dem',
  'dr',
  'dr.',
  'frau',
  'guten',
  'hallo',
  'hello',
  'herr',
  'hi',
  'liebe',
  'lieber',
  'liebes',
  'mit',
  'prof',
  'prof.',
  'sehr',
  'team',
  'the',
  'viele',
]);

const protectedFullNames = new Set(['noah klarmann']);

const connectorPattern = connectors.map(escapeRegExp).join('|');
const namePart = "\\p{Lu}[\\p{L}\\p{M}']*(?:[-']\\p{Lu}[\\p{L}\\p{M}']*)*";
const sequencePattern =
  connectorPattern.length > 0
    ? new RegExp(`\\b(${namePart})(?:\\s+(?:(?:${connectorPattern})\\s+)*${namePart})+`, 'gu')
    : new RegExp(`\\b(${namePart})(?:\\s+${namePart})+`, 'gu');

const connectorsSet = new Set(connectors.map((word) => word.toLowerCase()));

const singleNameRegex = new RegExp(`^${namePart}$`, 'u');

let filesProcessed = 0;
let filesWritten = 0;
let replacements = 0;

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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function shouldDropMatch(tokens) {
  if (tokens.length < 2) {
    return false;
  }

  const normalizedFullName = tokens.map((token) => token.toLowerCase()).join(' ');
  if (protectedFullNames.has(normalizedFullName)) {
    return false;
  }

  const [firstWord] = tokens;
  if (!singleNameRegex.test(firstWord) || blockedFirstWords.has(firstWord.toLowerCase())) {
    return false;
  }

  if (tokens.some((token) => token.includes('@'))) {
    return false;
  }

  return true;
}

function anonymizeContent(content) {
  return content.replace(sequencePattern, (match) => {
    const words = match.trim().split(/\s+/);
    const [firstWord] = words;
    const remaining = words.slice(1).filter((word) => !connectorsSet.has(word.toLowerCase()));
    const tokens = [firstWord, ...remaining];

    if (!shouldDropMatch(tokens)) {
      return match;
    }

    replacements += 1;
    return firstWord;
  });
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyStructureAndAnonymize(source, target) {
  const stats = await fs.stat(source);

  if (stats.isDirectory()) {
    await ensureDir(target);
    const entries = await fs.readdir(source);
    for (const entry of entries) {
      await copyStructureAndAnonymize(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  filesProcessed += 1;

  if (!source.endsWith('.md')) {
    await ensureDir(path.dirname(target));
    await fs.copyFile(source, target);
    return;
  }

  const content = await fs.readFile(source, 'utf8');
  const anonymized = anonymizeContent(content);
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, anonymized, 'utf8');
  filesWritten += 1;
}

async function main() {
  await ensureDir(outputDir);
  await copyStructureAndAnonymize(inputDir, outputDir);
console.log(
  `Processed ${filesProcessed} file(s), wrote ${filesWritten} Markdown file(s), applied ${replacements} name anonymization(s).`,
);
  console.log(`Output available at: ${outputDir}`);
}

main().catch((error) => {
  console.error('Failed to anonymize emails:', error);
  process.exitCode = 1;
});
