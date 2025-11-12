import type {
  StyleCategory,
  StyleGuidance,
  StyleProfileDocument,
  StyleCategoryProfile,
} from '../../types';
import styleProfilesRaw from './styleProfiles.json?raw';

const CATEGORY_LABELS: Record<StyleCategory, string> = {
  students: 'students (per Sie)',
  colleagues: 'colleagues (per Du)',
  industry: 'industry or research partners',
};

const profileDoc = JSON.parse(styleProfilesRaw) as StyleProfileDocument;

const ensureProfile = (category: StyleCategory): StyleCategoryProfile => {
  const profile = profileDoc.categories?.[category];
  if (profile) {
    return profile;
  }
  // fallback minimal profile
  return {
    totalEmails: 0,
    avgWords: 0,
    avgSentenceLength: 0,
    informalPronounRate: 0,
    formalPronounRate: 0,
    emojiRate: 0,
    exclamationRate: 0,
    topGreetings: [],
    topClosings: [],
    topSignatures: [],
    exemplarSubjects: [],
  };
};

const dedupeTexts = (entries: { text: string; count: number }[], max = 3) =>
  entries
    .map((entry) => entry.text)
    .filter(Boolean)
    .map((text) => text.trim())
    .filter((text, index, arr) => text && arr.indexOf(text) === index)
    .slice(0, max);

export const getStyleGuidance = (category: StyleCategory): StyleGuidance => {
  const profile = ensureProfile(category);

  const greetings = dedupeTexts(profile.topGreetings);
  const localizedGreetings =
    category === 'students'
      ? greetings.filter((greeting) => !/^dear/i.test(greeting))
      : greetings;
  const closings = dedupeTexts(profile.topClosings).filter((closing) =>
    category === 'industry' ? true : !/\b(best|kind)\b/i.test(closing),
  );
  const signatures = dedupeTexts(profile.topSignatures);

  const pronounPreference =
    profile.formalPronounRate > profile.informalPronounRate
      ? 'formal'
      : profile.informalPronounRate > profile.formalPronounRate
        ? 'informal'
        : 'mixed';

  const toneTips = [
    pronounPreference === 'formal'
      ? 'Use courteous Sie/ Ihnen forms and keep the tone structured.'
      : pronounPreference === 'informal'
        ? 'Use Du-friendly, collaborative language.'
        : 'Balance professionalism with approachable language.',
    profile.exclamationRate > 0.5 ? 'Occasional exclamation points are acceptable.' : 'Keep punctuation calm.',
    profile.emojiRate > 0.2 ? 'Light emoji use is acceptable.' : 'Avoid emoji for this audience.',
  ].join(' ');

  const summary = [
    `Avg words: ${profile.avgWords || 'n/a'}`,
    `Avg sentence length: ${profile.avgSentenceLength || 'n/a'}`,
  ].join(' • ');

  return {
    category,
    label: CATEGORY_LABELS[category],
    greetingExamples: localizedGreetings,
    closingExamples: closings,
    signatureExamples: signatures,
    pronounPreference,
    toneTips,
    summary,
  };
};
