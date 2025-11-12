import { sanitizeBody } from './email-utils.mjs';

const STUDENT_KEYWORDS = [
  'studierende',
  'studierenden',
  'student',
  'studentin',
  'studenten',
  'studium',
  'semester',
  'klausur',
  'vorlesung',
  'lehrveranstaltung',
  'ects',
  'campus',
  'thesis',
  'abschlussarbeit',
  'praktikum',
  'prüfung',
  'noten',
  'bewertung',
  'einschreibung',
  'immatrikulation',
  'exmatrikulation',
  'betreuungsanfrage',
  'projektarbeit',
  'modul',
  'lehre',
];

const INDUSTRY_KEYWORDS = [
  'angebot',
  'vertrag',
  'partner',
  'industrie',
  'unternehmen',
  'firma',
  'gmbh',
  'ag',
  'startup',
  'kooperation',
  'nda',
  'kunde',
  'kunden',
  'lieferant',
  'sponsor',
  'investor',
];

const COLLEAGUE_KEYWORDS = [
  'kollege',
  'kollegin',
  'kollegen',
  'team',
  'fakultät',
  'hochschule',
  'wi ',
  'prof.',
  'prof ',
  'gremium',
  'lehrstuhl',
  'mentoring',
  'mentoren',
];

const INFORMAL_PRONOUN_REGEX = /\b(du|dich|dir|dein(?:e|er|en)?)\b/gi;
const FORMAL_PRONOUN_REGEX = /\b(Sie|Ihnen|Ihr(?:e|en)?)\b/g;

export function classifyEmail(email) {
  const text = `${email.subject ?? ''}\n${email.body ?? email.sanitizedBody ?? ''}`.toLowerCase();
  const toLine = (email.to ?? '').toLowerCase();

  if (hasIndustrySignals(text)) {
    return 'industry';
  }

  if (hasStudentSignals(text)) {
    return 'students';
  }

  if (hasColleagueSignals(text, toLine)) {
    return 'colleagues';
  }

  const cleaned = email.sanitizedBody ?? sanitizeBody(email.body ?? '');
  const informalCount = matchCount(cleaned, INFORMAL_PRONOUN_REGEX);
  const formalCount = matchCount(cleaned, FORMAL_PRONOUN_REGEX);

  if (informalCount > formalCount) {
    return 'colleagues';
  }

  if (formalCount > 0) {
    return 'students';
  }

  return 'students';
}

export function getPronounStats(text) {
  return {
    informal: matchCount(text, INFORMAL_PRONOUN_REGEX),
    formal: matchCount(text, FORMAL_PRONOUN_REGEX),
  };
}

function hasIndustrySignals(text) {
  return (
    containsKeyword(text, INDUSTRY_KEYWORDS) ||
    /\b(gmbh|ag|kg|ug|inc|llc|corp|ltd)\b/i.test(text) ||
    /\bnda\b/i.test(text)
  );
}

function hasStudentSignals(text) {
  return containsKeyword(text, STUDENT_KEYWORDS) || /\bstudierenden\b|\bstudierende\b/i.test(text);
}

function hasColleagueSignals(text, toLine) {
  return containsKeyword(text, COLLEAGUE_KEYWORDS) || containsKeyword(toLine, COLLEAGUE_KEYWORDS) || /\bwi-/.test(toLine);
}

function containsKeyword(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some((word) => lower.includes(word));
}

function matchCount(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}
