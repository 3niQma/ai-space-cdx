import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listMarkdownFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith('.md')) {
        return [fullPath];
      }
      return [];
    }),
  );
  return nested.flat();
}

export async function parseEmailFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return null;
    }
    const meta = parseFrontmatter(frontmatterMatch[1]);
    const remainder = raw.slice(frontmatterMatch[0].length).trim();
    const from = extractLineValue(remainder, 'From');
    const to = extractLineValue(remainder, 'To');
    const date = extractLineValue(remainder, 'Date');

    const body = remainder
      .split('\n')
      .filter((line) => !line.startsWith('**From:**') && !line.startsWith('**To:**') && !line.startsWith('**Date:**'))
      .join('\n')
      .trim();

    return {
      path: filePath,
      id: meta.id ?? path.basename(filePath, '.md'),
      subject: meta.subject,
      direction: meta.direction,
      rawDate: meta.date,
      metadata: meta,
      from,
      to,
      date,
      body,
      sanitizedBody: sanitizeBody(body),
    };
  } catch (error) {
    console.warn(`Failed to parse ${filePath}: ${error.message}`);
    return null;
  }
}

export function sanitizeBody(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#+\s.*$/gm, '')
    .replace(/>\s?.*$/gm, '')
    .replace(/\*\*(From|To|Date):.*$/gim, '')
    .replace(/^(from|to|cc|an|von|betreff|subject|gesendet|date):.*$/gim, '')
    .trim();
}

function parseFrontmatter(block) {
  return block.split('\n').reduce((acc, line) => {
    const [key, ...rest] = line.split(':');
    if (!key || rest.length === 0) {
      return acc;
    }
    const value = rest.join(':').trim().replace(/^"|"$/g, '');
    acc[key.trim()] = value;
    return acc;
  }, {});
}

function extractLineValue(text, label) {
  const boldRegex = new RegExp(`^\\*\\*${escapeRegExp(label)}:\\*\\*\\s*(.*)$`, 'mi');
  const boldMatch = text.match(boldRegex);
  if (boldMatch) {
    return boldMatch[1].trim();
  }
  const plainRegex = new RegExp(`^${escapeRegExp(label)}:\\s*(.*)$`, 'mi');
  const plainMatch = text.match(plainRegex);
  return plainMatch ? plainMatch[1].trim() : undefined;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
