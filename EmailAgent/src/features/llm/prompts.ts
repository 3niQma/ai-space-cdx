import type { GenerationMode, StyleGuidance } from '../../types';

const BASE_SYSTEM_PROMPT =
  'You are a professional email assistant helping Noah Klarmann craft polished replies. ' +
  "Always produce a ready-to-send email that sounds courteous, addresses each point, and ends with Noah's signature.";

const buildUserPrompt = (email: string, intent: string, contextBlock?: string) => `
Original Email:
${email}

Noah's Response Intent:
${intent}

${contextBlock ? `Relevant context:\n${contextBlock}\n\n` : ''}
Generate the full response email text.`;

const formatStyleGuidance = (guidance: StyleGuidance) => {
  const lines = [
    `Audience: ${guidance.label}`,
    `Pronouns: ${guidance.pronounPreference === 'formal' ? 'Use Sie/Ihnen forms.' : guidance.pronounPreference === 'informal' ? 'Use Du forms and keep it collaborative.' : 'Balance Sie and Du sensitively.'}`,
    guidance.greetingExamples.length ? `Preferred greetings: ${guidance.greetingExamples.join(', ')}` : undefined,
    guidance.closingExamples.length ? `Preferred closings: ${guidance.closingExamples.join(', ')}` : undefined,
    guidance.signatureExamples.length ? `Signature cues: ${guidance.signatureExamples.join(', ')}` : undefined,
    guidance.toneTips,
    guidance.summary,
  ].filter(Boolean);
  return lines.map((line) => `- ${line}`).join('\n');
};

const buildSystemPrompt = (
  mode: GenerationMode,
  styleGuidance?: StyleGuidance,
  language?: 'de' | 'en',
  enforcedSalutation?: string,
) => {
  const notes: string[] = [];
  if ((mode === 'style' || mode === 'rag') && styleGuidance) {
    notes.push(`Follow these style guidelines precisely:\n${formatStyleGuidance(styleGuidance)}`);
  }
  if (language) {
    notes.push(language === 'de' ? 'Respond in German (Deutsch) only.' : 'Respond in English only.');
  }
  if (enforcedSalutation) {
    notes.push(`Begin the email with exactly this salutation (once): "${enforcedSalutation},".`);
  }
  if (!notes.length) {
    return BASE_SYSTEM_PROMPT;
  }
  return `${BASE_SYSTEM_PROMPT}\n${notes.join('\n')}`;
};

interface PromptParams {
  email: string;
  intent: string;
  mode: GenerationMode;
  styleGuidance?: StyleGuidance;
  contextBlock?: string;
  language?: 'de' | 'en';
  enforcedSalutation?: string;
}

export const buildMessages = ({
  email,
  intent,
  mode,
  styleGuidance,
  contextBlock,
  language,
  enforcedSalutation,
}: PromptParams) => [
  { role: 'system', content: buildSystemPrompt(mode, styleGuidance, language, enforcedSalutation) },
  { role: 'user', content: buildUserPrompt(email, intent, contextBlock) },
];
