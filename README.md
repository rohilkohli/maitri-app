# Maitri - Adaptive Learning Intelligence

**PromptWars Solution Challenge Entry**

Maitri is an AI-powered adaptive learning platform that creates personalized learning journeys for students. It adapts to each learner's class level, board curriculum, and subject preferences to deliver truly customized educational experiences.

## Core Features

### 1. Dynamic Diagnostic Assessment
- AI-generated questions tailored to student's class level (5th-12th, College)
- Curriculum-aligned content (CBSE, ICSE, State Boards, IB, AP, GCSE)
- Real-time difficulty adaptation based on performance
- Instant feedback with detailed explanations

### 2. Personalized Onboarding
- Flexible subject selection with "Other" option for custom subjects
- Class level and board customization
- Camera-based syllabus scanning with AI OCR
- Self-assessment confidence rating

### 3. Knowledge Tracking
- Bayesian knowledge tracing for mastery estimation
- Misconception detection and remediation
- Progress visualization with analytics dashboard
- Spaced repetition flashcards

### 4. AI-Powered Content
- Google Gemini integration for question generation
- LaTeX math rendering via KaTeX
- Curriculum-appropriate content for any subject/level

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **AI/ML**: Google Gemini API, Bayesian Knowledge Tracing
- **Auth**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Supabase (PDF uploads)
- **Math Rendering**: KaTeX

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev

# Build for production
npm run build
npm run start
```

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Project Structure

```
maitri-app/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login/Signup pages
│   ├── (main)/            # Dashboard pages with sidebar
│   ├── diagnostic/        # Adaptive diagnostic test
│   ├── onboarding/        # User onboarding flow
│   └── api/ai/            # AI API routes
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── sidebar.tsx       # Navigation sidebar
│   └── katex-math.tsx    # Math rendering
├── lib/                   # Utilities and services
│   ├── firebase.ts       # Firebase configuration
│   ├── ai-question-generator.ts  # Gemini AI integration
│   ├── validation.ts     # Input validation/security
│   └── hooks/            # Custom React hooks
└── types/                 # TypeScript type definitions
```

## Key Differentiators

1. **True Adaptivity**: Questions dynamically generated based on student profile
2. **Curriculum Alignment**: Supports multiple education boards (CBSE, ICSE, IB, AP, etc.)
3. **Flexibility**: "Other" option allows any custom subject/board/exam
4. **Security**: Input validation, XSS prevention, secure API key handling
5. **Accessibility**: ARIA labels, keyboard navigation, focus management

## Testing

```bash
# Run unit tests
npm test

# Type checking
npx tsc --noEmit
```

## Security Considerations

- All user inputs are sanitized to prevent XSS
- API keys stored in environment variables
- Firebase security rules enforce user data isolation
- No sensitive data exposed in client-side code

## Accessibility

- ARIA roles and labels for screen readers
- Keyboard navigation support
- Focus management for interactive elements
- Color contrast compliant design

## License

MIT License - Built for PromptWars Solution Challenge
