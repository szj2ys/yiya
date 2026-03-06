/**
 * Shared test data and selectors used across E2E tests.
 *
 * Since the app uses Clerk for auth and NeonDB for storage, E2E tests
 * target the running dev server with real (or seeded) data. Tests are
 * designed to work with the seed data from `scripts/seed.ts`.
 */

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const sel = {
  // Landing page
  heroHeading: "text=Speak confidently.",
  getStartedBtn: 'button:has-text("Get Started Free")',
  signInBtn: 'button:has-text("I have an account")',
  continueLearningBtn: 'a:has-text("Continue Learning")',

  // Sidebar navigation
  sidebar: {
    learn: 'a:has-text("Learn")',
    leaderboard: 'a:has-text("Leaderboard")',
    quests: 'a:has-text("Quests")',
    shop: 'a:has-text("Shop")',
  },

  // Courses page
  coursesTitle: "text=Language Courses",
  courseCard: (title: string) => `div:has-text("${title}")`,

  // Learn page
  learnHeader: (courseTitle: string) => `text=${courseTitle}`,
  startFirstLesson: 'button:has-text("Start first lesson")',
  practiceEntry: '[class*="practice"]',

  // Lesson / Quiz page
  lessonProgress: '[role="progressbar"]',
  heartDisplay: 'img[alt="Heart"]',
  checkBtn: 'button:has-text("Check")',
  nextBtn: 'button:has-text("Next")',
  retryBtn: 'button:has-text("Retry")',
  continueBtn: 'button:has-text("Continue")',
  exitX: "header svg.lucide-x, header .lucide-x",
  answerOption: (index: number) => `.grid > div:nth-child(${index})`,

  // Completion screen
  lessonComplete: "text=Lesson complete",
  accuracyText: "text=/\\d+\\/\\d+ correct/",
  practiceWeakItems: 'button:has-text("Practice weak items")',

  // Modals
  exitModal: {
    title: "text=Wait, don't go!",
    keepLearning: 'button:has-text("Keep learning")',
    endSession: 'button:has-text("End session")',
  },
  heartsModal: {
    title: "text=Keep your streak going",
    continueLearning: 'button:has-text("Continue learning")',
    notNow: 'button:has-text("Not now")',
  },
  practiceModal: {
    title: "text=Practice lesson",
    understand: 'button:has-text("I understand")',
  },

  // Shop page
  shopTitle: "text=Shop",
  refillHeartsBtn: 'button:has-text("full"), button:has-text("10")',
  upgradeBtn: 'button:has-text("upgrade")',
  settingsBtn: 'button:has-text("settings")',

  // Leaderboard page
  leaderboardTitle: "text=Leaderboard",
  xpDisplay: "text=/\\d+ XP/",

  // Quests page
  questsTitle: "text=Quests",
  questItem: (xp: number) => `text=Earn ${xp} XP`,

  // Error boundary
  errorHeading: "text=/something went wrong/i",
  tryAgainBtn: 'button:has-text("Try again")',
} as const;

// ---------------------------------------------------------------------------
// Test URLs
// ---------------------------------------------------------------------------

export const urls = {
  home: "/",
  courses: "/courses",
  learn: "/learn",
  shop: "/shop",
  leaderboard: "/leaderboard",
  quests: "/quests",
  lesson: "/lesson",
  lessonById: (id: number) => `/lesson/${id}`,
  admin: "/admin",
} as const;

// ---------------------------------------------------------------------------
// Languages from seed data
// ---------------------------------------------------------------------------

export const languages = [
  "English",
  "Chinese",
  "Spanish",
  "French",
  "Italian",
  "Japanese",
] as const;
