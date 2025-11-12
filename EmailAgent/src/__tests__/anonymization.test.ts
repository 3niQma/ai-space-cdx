import { describe, expect, it } from 'vitest';
import { anonymizeText } from '../features/anonymization/anonymize';
import { deanonymizeText } from '../features/anonymization/deanonymize';

const sampleEmail = `Hi Noah Klarmann,

I just spoke with John Smith from Example Inc. You can reach him at john.smith@example.com or (555) 123-4567.

Best,
Alice Johnson`;

describe('anonymization utilities', () => {
  it('replaces emails, companies, phones, and names with deterministic placeholders', () => {
    const result = anonymizeText(sampleEmail);
    expect(result.mappings.length).toBeGreaterThanOrEqual(3);
    expect(result.anonymizedText).toMatch(/\[PERSON_1]/);
    expect(result.anonymizedText).toMatch(/\[COMPANY_1]/);
    expect(result.anonymizedText).toMatch(/\[EMAIL_1]/);
    expect(result.anonymizedText).toMatch(/\[PHONE_1]/);
  });

  it('never anonymizes Noah Klarmann', () => {
    const result = anonymizeText(sampleEmail);
    expect(result.anonymizedText).toContain('Noah Klarmann');
    const matchedNoah = result.mappings.find((mapping) => mapping.originalValue.includes('Noah'));
    expect(matchedNoah).toBeUndefined();
  });

  it('restores placeholders back to original values', () => {
    const result = anonymizeText(sampleEmail);
    const restored = deanonymizeText(result.anonymizedText, result.mappings);
    expect(restored).toBe(sampleEmail);
  });
});
