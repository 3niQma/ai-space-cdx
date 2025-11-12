import type { StyleCategory } from '../../types';

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
  'ects',
  'thesis',
  'abschlussarbeit',
  'praktikum',
  'prüfung',
  'noten',
  'einschreibung',
  'immatrikulation',
  'projektarbeit',
  'modul',
];

const INDUSTRY_KEYWORDS = [
  'angebot',
  'vertrag',
  'partner',
  'unternehmen',
  'firma',
  'gmbh',
  'ag',
  'startup',
  'kooperation',
  'kunde',
  'lieferant',
  'investor',
  'sponsor',
  'nda',
  'projekt',
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
  'mentoring',
  'gremium',
  'vorstand',
];

const INFORMAL_REGEX = /\b(du|dich|dir|dein(?:e|er|en)?)\b/gi;
const FORMAL_REGEX = /\b(Sie|Ihnen|Ihr(?:e|en)?)\b/g;

const normalize = (text: string) => text.toLowerCase();

const containsKeyword = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

export const classifyAudience = (input: string): StyleCategory => {
  const text = normalize(input);

  if (containsKeyword(text, INDUSTRY_KEYWORDS) || /\b(gmbh|ag|kg|ug|llc|inc|corp|ltd)\b/.test(text)) {
    return 'industry';
  }

  if (containsKeyword(text, STUDENT_KEYWORDS) || /\bstudierende[nr]?\b/.test(text)) {
    return 'students';
  }

  if (containsKeyword(text, COLLEAGUE_KEYWORDS) || /\bwi-/.test(text)) {
    return 'colleagues';
  }

  const informalMatches = text.match(INFORMAL_REGEX)?.length ?? 0;
  const formalMatches = text.match(FORMAL_REGEX)?.length ?? 0;

  if (informalMatches > formalMatches) {
    return 'colleagues';
  }

  if (formalMatches > 0) {
    return 'students';
  }

  return 'industry';
};
