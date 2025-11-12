# EmailAgent2 - AI Email Response Generator

## Project Overview

EmailAgent2 is a web-based application that generates professional email responses using Large Language Models (LLMs) while maintaining GDPR compliance through intelligent anonymization. The application allows users to paste incoming emails, provide brief response intents, and receive professionally crafted responses that preserve privacy by anonymizing personal information during processing.

## Core Purpose

Users receive emails and need to respond quickly and professionally. Instead of writing responses from scratch, they can:
1. Paste the original email
2. Optionally anonymize it to protect third-party privacy (GDPR compliance)
3. Provide a short intent ("yes", "meet next week", "decline politely")
4. Generate a professional response using AI
5. De-anonymize to restore original names
6. Copy and send the response

**Key Constraint:** Noah Klarmann's name must never be anonymized as he is the email sender.

## Technical Stack

- Frontend: React 18 + TypeScript
- Build Tool: Vite
- UI Library: Material-UI (MUI) v5
- LLM Provider: Anthropic Claude API (Claude 3.5 Sonnet)
- State Management: React hooks (useState, custom hooks)

## User Interface Components

### 1. Email Input Component
Multi-line textarea for pasting original email content.
- Controlled component with state management
- Supports 2000+ character emails
- Clear visual distinction from other inputs
- Shows anonymization status

### 2. Short Answer Input Component
Single-line text input for response intent.
- 200 character limit
- Examples: "yes", "schedule for Tuesday", "decline politely"
- Clear placeholder text with examples

### 3. Response Display Component
Read-only display with action buttons.
- Shows generated email response
- Copy to clipboard button
- Edit mode toggle
- Regenerate button
- De-anonymize button (when applicable)
- Shows token usage and cost estimation

### 4. Status Indicators
- Loading spinner during API calls
- Error alerts with clear messages
- Success confirmations
- Token usage display
- Cost per request display

## Core Features

### Anonymization System

**Purpose:** GDPR-compliant removal of personally identifiable information (PII) before sending to LLM.

**Implementation:**
- Client-side only (no server processing)
- Regex-based pattern matching
- Creates reversible mappings

**Patterns to Anonymize:**
- Personal names → [PERSON_1], [PERSON_2], etc.
  - Regex: `\b(?!Noah\b)(?!Klarmann\b)[A-Z][a-z]+\s[A-Z][a-z]+\b`
  - Exception: "Noah Klarmann" is preserved
- Email addresses → [EMAIL_1], [EMAIL_2], etc.
  - Regex: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`
- Phone numbers → [PHONE_1], [PHONE_2], etc.
  - Regex: `(\+\d{1,3}[-.\s]??)?\(?\d{3}\)?[-.\s]??\d{3}[-.\s]??\d{4}`
- Company names → [COMPANY_1], [COMPANY_2], etc.
  - Regex: `\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s(?:Inc|LLC|Ltd|GmbH|Corp|Corporation)\b`

**Data Structure:**
```typescript
interface AnonymizationMapping {
  type: 'name' | 'email' | 'phone' | 'company';
  placeholder: string;      // "[PERSON_1]"
  originalValue: string;    // "John Smith"
}

interface AnonymizationResult {
  anonymizedText: string;
  mappings: AnonymizationMapping[];
  preservedTerms: string[]; // ["Noah Klarmann"]
}
```

### De-anonymization System

**Purpose:** Restore original names and information after LLM generates response.

**Implementation:**
- Uses stored mapping from anonymization step
- Pattern matching and replacement in LLM response
- Preserves response structure and formatting

### LLM Integration

**Provider:** Anthropic Claude API
**Model:** claude-3-5-sonnet-20241022
**Max Tokens:** 1024 (configurable)

**System Prompt Structure:**
```
You are a professional email assistant helping Noah Klarmann draft responses.

Original Email:
[anonymized or original email content]

Noah's Response Intent:
[short answer from user]

Generate a professional, clear, and concise email response that:
- Uses appropriate greeting and closing
- Matches the tone of the original email
- Addresses all points from the original email
- Implements Noah's response intent
- Is ready to send without further editing
- Maintains professional tone
- Is signed by Noah Klarmann
```

**API Request:**
```typescript
{
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [system prompt + email + intent]
    }
  ]
}
```

**Response Handling:**
- Extract generated text from response
- Track token usage (input + output)
- Calculate cost (input: $3/MTok, output: $15/MTok)
- Display usage metrics to user
- Handle errors gracefully

### Error Handling

**API Errors:**
- 401 Unauthorized → "Invalid API key. Check environment configuration"
- 429 Rate Limit → "Rate limit exceeded. Wait and try again"
- 500 Server Error → "API error. Try again later"
- Network Error → "Check internet connection"

**User Input Validation:**
- Empty email → Show warning
- Empty short answer → Show warning
- Missing API key → Clear setup instructions

## Application State

```typescript
interface AppState {
  // Email content
  originalEmail: string;
  anonymizedEmail: string;

  // User input
  shortAnswer: string;

  // Generated responses
  llmResponse: string;
  deanonymizedResponse: string;

  // Anonymization data
  anonymizationMappings: AnonymizationMapping[];
  isAnonymized: boolean;

  // UI state
  isGenerating: boolean;
  isEditingResponse: boolean;

  // Errors
  anonymizationError: string | null;
  llmError: string | null;

  // Usage tracking
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  } | null;
}
```

## User Workflow

### Complete Flow:
1. User pastes original email into Email Input
2. User clicks "Anonymize Email" button (optional)
   - System processes email client-side
   - Replaces PII with placeholders
   - Stores mapping for reversal
   - Shows anonymized version
3. User enters short answer ("yes", "meet Thursday")
4. User clicks "Generate Response"
   - Loading spinner appears
   - API call to Claude with anonymized email + intent
   - Wait 2-5 seconds
5. Response appears in Response Display
   - Shows generated email
   - Shows token usage
   - Shows estimated cost
6. User clicks "De-anonymize Response" (if anonymized)
   - Restores original names using stored mappings
   - Shows final version ready to send
7. User copies response or edits if needed
8. User sends email (outside application)

### Alternative Flow (Skip Anonymization):
1. Paste email
2. Enter short answer
3. Generate response directly (original content sent to LLM)
4. Copy response

## Project Structure

```
src/
├── features/
│   ├── anonymization/
│   │   ├── anonymize.ts          # Core anonymization logic
│   │   ├── deanonymize.ts        # Reversal logic
│   │   ├── patterns.ts           # Regex patterns
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── index.ts              # Public API
│   ├── llm/
│   │   ├── anthropicApi.ts       # Claude API client
│   │   ├── prompts.ts            # System prompts
│   │   ├── config.ts             # Configuration
│   │   ├── types.ts              # Request/response types
│   │   └── index.ts              # Public API
│   └── email/
│       └── types.ts              # Email-related types
├── hooks/
│   ├── useAnonymization.ts       # Anonymization state management
│   ├── useLLMGeneration.ts       # LLM API state management
│   └── useClipboard.ts           # Copy to clipboard utility
├── components/
│   ├── EmailInput.tsx            # Email textarea component
│   ├── ShortAnswerInput.tsx      # Intent input component
│   └── ResponseDisplay.tsx       # Generated response display
├── types/
│   └── index.ts                  # Shared type definitions
├── App.tsx                       # Main application component
└── main.tsx                      # Application entry point
```

## Environment Configuration

Required environment variables in `.env.local`:

```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional (with defaults)
VITE_MODEL_NAME=claude-3-5-sonnet-20241022
VITE_MAX_TOKENS=1024
```

## Non-Functional Requirements

### Performance
- Anonymization: < 100ms for typical emails
- LLM API call: 2-5 seconds
- UI remains responsive during API calls

### Security
- API keys in `.env.local` (never committed)
- No server-side storage of emails
- All anonymization happens client-side
- HTTPS for API calls
- Warning: Client-side API calls expose key in development
  - Production deployment should use backend proxy

### Privacy
- No email content sent anywhere except chosen LLM
- No analytics or tracking
- Local-only processing for anonymization
- Clear data handling for users

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- Clear visual feedback
- ARIA labels on interactive elements

## Implementation Notes

### Custom Hooks Pattern

**useAnonymization:**
```typescript
const useAnonymization = () => {
  const [anonymizedText, setAnonymizedText] = useState('');
  const [mappings, setMappings] = useState<AnonymizationMapping[]>([]);
  const [error, setError] = useState<string | null>(null);

  const anonymize = (text: string) => {
    // Anonymization logic
  };

  const deanonymize = (text: string) => {
    // De-anonymization logic
  };

  return { anonymizedText, mappings, error, anonymize, deanonymize };
};
```

**useLLMGeneration:**
```typescript
const useLLMGeneration = () => {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<TokenUsage | null>(null);

  const generateResponse = async (email: string, intent: string) => {
    // API call logic
  };

  return { response, isGenerating, error, usage, generateResponse };
};
```

### Material-UI Layout

Main app uses MUI components:
- Container (max-width: lg)
- Paper for elevated sections
- Grid for responsive layout
- TextField for inputs
- Button with loading states
- Alert for errors
- Typography for text hierarchy
- Box for spacing and layout

## Testing Strategy

### Manual Testing Scenarios

1. **Basic flow:** Paste email → Enter intent → Generate → Copy
2. **Anonymization flow:** Paste → Anonymize → Generate → De-anonymize → Copy
3. **Error handling:** Invalid API key, network errors, empty inputs
4. **Edge cases:** Very long emails, special characters, multiple names
5. **Name preservation:** Verify Noah Klarmann never anonymized
6. **De-anonymization accuracy:** All placeholders correctly replaced

### Test Email Examples

Use variety of email types:
- Business meeting requests
- Academic inquiries
- Conference invitations
- Simple yes/no questions
- Complex multi-person threads

## Deployment

### Development
```bash
npm install
npm run dev
# Access at http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

### Hosting Options
- Vercel (recommended for Vite projects)
- Netlify
- GitHub Pages

### Production Considerations
- Move API key to backend proxy
- Add rate limiting
- Implement usage quotas
- Set up monitoring
- Add error tracking (Sentry)

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@anthropic-ai/sdk": "^0.20.9"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.2.0"
  }
}
```

## Success Criteria

Application is successful when:
- User can paste email and generate professional response in < 30 seconds
- Anonymization preserves Noah Klarmann's name 100% of time
- De-anonymization restores all names correctly
- Error messages are clear and actionable
- Generated responses are professional and context-appropriate
- UI is intuitive with no training required
- Cost per email is < $0.01
- Application works across major browsers
- No crashes or data loss during normal use

## Future Enhancements

Potential improvements (not in initial scope):
- Response streaming for faster perceived performance
- Multiple LLM provider support (OpenAI, local models)
- Response history and favorites
- Custom prompt templates
- Tone selection (formal, casual, friendly)
- Backend proxy for production security
- User accounts and settings
- Analytics dashboard
- Multi-language support

## Cost Estimation

Using Claude 3.5 Sonnet:
- Input tokens: $3 per million tokens
- Output tokens: $15 per million tokens

Typical email response:
- Input: 1,500 tokens (email + prompt)
- Output: 300 tokens (response)
- Cost: ~$0.006 per response

Monthly usage (10 emails/day):
- 300 emails/month × $0.006 = ~$1.80/month

Heavy usage (100 emails/day):
- 3,000 emails/month × $0.006 = ~$18/month

---

**This specification provides complete requirements for implementing EmailAgent2 from scratch without requiring access to the original codebase or Claude Code infrastructure.**
