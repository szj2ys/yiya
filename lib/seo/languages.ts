export interface SamplePhrase {
  original: string;
  translation: string;
  romanization?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface LanguagePageData {
  slug: string;
  languageName: string;
  nativeName: string;
  flagCode: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  samplePhrases: SamplePhrase[];
  features: { title: string; description: string }[];
  faqs: FAQ[];
}

export const LANGUAGE_PAGES: LanguagePageData[] = [
  {
    slug: "spanish",
    languageName: "Spanish",
    nativeName: "Espanol",
    flagCode: "es",
    heroTitle: "Learn Spanish Online",
    heroHighlight: "Speak Spanish with confidence.",
    heroDescription:
      "Master Spanish vocabulary and grammar through bite-size interactive lessons. Yiya uses AI-powered explanations and spaced repetition to help you remember what you learn and build real conversational skills.",
    metaTitle: "Learn Spanish Online Free - Interactive Lessons & AI Explanations",
    metaDescription:
      "Start learning Spanish today with free interactive lessons. Yiya uses AI explanations on wrong answers, FSRS spaced repetition, and 3 challenge types to help you speak Spanish confidently.",
    keywords: [
      "learn spanish online",
      "spanish lessons free",
      "spanish vocabulary practice",
      "spanish for beginners",
      "learn spanish app",
    ],
    samplePhrases: [
      { original: "Buenos dias", translation: "Good morning" },
      { original: "Donde esta la biblioteca?", translation: "Where is the library?" },
      { original: "Me llamo...", translation: "My name is..." },
      { original: "Mucho gusto", translation: "Nice to meet you" },
      { original: "Gracias por tu ayuda", translation: "Thank you for your help" },
    ],
    features: [
      {
        title: "Conversational Spanish",
        description:
          "Learn the phrases and vocabulary you actually need for real conversations, from ordering food to making friends.",
      },
      {
        title: "Spanish Verb Conjugation",
        description:
          "Practice regular and irregular verb forms with instant feedback and AI-powered explanations when you make mistakes.",
      },
      {
        title: "Spaced Repetition for Spanish",
        description:
          "Our FSRS algorithm schedules reviews at the optimal time so you retain Spanish vocabulary long-term, not just for a test.",
      },
    ],
    faqs: [
      {
        question: "Is Yiya free to learn Spanish?",
        answer:
          "Yes! You can start learning Spanish for free right away. Yiya offers interactive lessons, AI explanations, and spaced repetition at no cost. No credit card required.",
      },
      {
        question: "How long does it take to learn Spanish with Yiya?",
        answer:
          "Most learners start recognizing common words and phrases within the first week. With consistent daily practice of 10-15 minutes, you can build a solid foundation in 2-3 months. Yiya's spaced repetition ensures you retain what you learn.",
      },
      {
        question: "What makes Yiya different from other Spanish learning apps?",
        answer:
          "Yiya stands out with AI-powered explanations when you get an answer wrong, helping you understand why -- not just what -- the correct answer is. Combined with FSRS spaced repetition and three different challenge types, you learn faster and remember longer.",
      },
      {
        question: "Can I learn Spanish as a complete beginner?",
        answer:
          "Absolutely. Yiya's Spanish course starts from the very basics and gradually builds your vocabulary and understanding. The AI explanations provide extra context whenever you need it, making it perfect for beginners.",
      },
      {
        question: "How does the AI explanation feature work for Spanish?",
        answer:
          "When you answer a question incorrectly, Yiya's AI instantly generates a clear, contextual explanation in English. It breaks down grammar rules, vocabulary nuances, and common mistakes so you learn from every error.",
      },
    ],
  },
  {
    slug: "chinese",
    languageName: "Chinese",
    nativeName: "Zhongwen",
    flagCode: "cn",
    heroTitle: "Learn Chinese Online",
    heroHighlight: "Read and speak Chinese with confidence.",
    heroDescription:
      "Build your Chinese vocabulary through interactive lessons designed for practical communication. Yiya uses AI explanations and spaced repetition to make learning Chinese characters approachable and effective.",
    metaTitle: "Learn Chinese Online Free - Characters, Pinyin & AI Lessons",
    metaDescription:
      "Start learning Chinese today with free interactive lessons. Master Chinese characters, pinyin, and vocabulary with AI-powered explanations and FSRS spaced repetition.",
    keywords: [
      "learn chinese online",
      "chinese lessons free",
      "learn mandarin",
      "chinese characters for beginners",
      "chinese vocabulary practice",
    ],
    samplePhrases: [
      { original: "\u4f60\u597d", translation: "Hello", romanization: "ni hao" },
      { original: "\u8c22\u8c22", translation: "Thank you", romanization: "xie xie" },
      { original: "\u5bf9\u4e0d\u8d77", translation: "Sorry", romanization: "dui bu qi" },
      { original: "\u6211\u53eb...", translation: "My name is...", romanization: "wo jiao..." },
      {
        original: "\u591a\u5c11\u94b1\uff1f",
        translation: "How much?",
        romanization: "duo shao qian?",
      },
    ],
    features: [
      {
        title: "Chinese Character Recognition",
        description:
          "Learn to recognize and understand common Chinese characters through repeated, contextual exposure in interactive exercises.",
      },
      {
        title: "Pinyin and Pronunciation",
        description:
          "Build a solid pinyin foundation alongside character learning, so you can both read and speak Chinese from day one.",
      },
      {
        title: "Practical Chinese Vocabulary",
        description:
          "Focus on the words and phrases most useful for daily life, travel, and conversation rather than obscure textbook vocabulary.",
      },
    ],
    faqs: [
      {
        question: "Is Yiya free to learn Chinese?",
        answer:
          "Yes! Yiya lets you start learning Chinese completely free. Access interactive lessons, AI-powered explanations, and spaced repetition without any payment or credit card.",
      },
      {
        question: "Is Chinese hard to learn for English speakers?",
        answer:
          "Chinese has unique challenges like tones and characters, but Yiya breaks it down into manageable lessons. Our AI explanations help demystify tricky concepts, and spaced repetition ensures you remember characters long-term. Many learners are surprised how quickly they progress.",
      },
      {
        question: "Do I need to learn Chinese characters to use Yiya?",
        answer:
          "Yiya teaches characters alongside pinyin romanization, so you learn both simultaneously. You do not need any prior knowledge of characters to get started.",
      },
      {
        question: "How does spaced repetition help with Chinese characters?",
        answer:
          "Chinese characters require consistent review to stick in memory. Yiya's FSRS algorithm tracks how well you know each character and schedules reviews at scientifically optimal intervals, so you spend time where it matters most.",
      },
      {
        question: "What level of Chinese can I reach with Yiya?",
        answer:
          "Yiya's Chinese course covers essential vocabulary and phrases for everyday communication. With consistent daily practice, you can build a practical foundation for travel, basic conversations, and further study.",
      },
    ],
  },
  {
    slug: "french",
    languageName: "French",
    nativeName: "Francais",
    flagCode: "fr",
    heroTitle: "Learn French Online",
    heroHighlight: "Speak French like you mean it.",
    heroDescription:
      "Master French vocabulary and grammar through interactive lessons that actually stick. Yiya's AI explanations help you understand the why behind every answer, while spaced repetition locks it into long-term memory.",
    metaTitle: "Learn French Online Free - Interactive Lessons & AI Tutoring",
    metaDescription:
      "Start learning French today with free interactive lessons. Yiya uses AI explanations, FSRS spaced repetition, and 3 challenge types to help you speak French confidently.",
    keywords: [
      "learn french online",
      "french lessons free",
      "french vocabulary practice",
      "french for beginners",
      "learn french app",
    ],
    samplePhrases: [
      { original: "Bonjour", translation: "Hello / Good morning" },
      { original: "Comment allez-vous?", translation: "How are you?" },
      { original: "Je m'appelle...", translation: "My name is..." },
      { original: "S'il vous plait", translation: "Please" },
      { original: "Merci beaucoup", translation: "Thank you very much" },
    ],
    features: [
      {
        title: "French Pronunciation Practice",
        description:
          "Tackle French pronunciation with interactive exercises. AI explanations break down tricky sounds and liaison rules when you stumble.",
      },
      {
        title: "French Grammar Made Simple",
        description:
          "Learn gender, conjugation, and sentence structure through practice -- not memorization. Get instant AI feedback on every mistake.",
      },
      {
        title: "Everyday French Vocabulary",
        description:
          "Build vocabulary for real situations: travel, dining, shopping, and social conversations. Spaced repetition keeps it fresh.",
      },
    ],
    faqs: [
      {
        question: "Is Yiya free to learn French?",
        answer:
          "Yes! Start learning French for free with interactive lessons, AI-powered explanations, and spaced repetition. No credit card needed to get started.",
      },
      {
        question: "How quickly can I learn French with Yiya?",
        answer:
          "With 10-15 minutes of daily practice, most learners start forming basic French sentences within 2-3 weeks. Yiya's spaced repetition ensures you build on what you know without forgetting previous lessons.",
      },
      {
        question: "Is French difficult for English speakers?",
        answer:
          "French actually shares a lot of vocabulary with English due to historical connections. Yiya leverages these similarities and uses AI explanations to clarify differences in grammar and pronunciation, making French very approachable.",
      },
      {
        question: "What topics does the French course cover?",
        answer:
          "The course covers greetings, everyday conversations, food and dining, travel phrases, numbers, time, and more. Each unit builds on the previous one with progressively challenging vocabulary and grammar.",
      },
      {
        question: "How does Yiya help with French pronunciation?",
        answer:
          "Yiya's challenge types include listening exercises that train your ear for French sounds. When you make a mistake, the AI explanation breaks down pronunciation rules and common pitfalls specific to English speakers learning French.",
      },
    ],
  },
  {
    slug: "italian",
    languageName: "Italian",
    nativeName: "Italiano",
    flagCode: "it",
    heroTitle: "Learn Italian Online",
    heroHighlight: "Fall in love with Italian.",
    heroDescription:
      "Learn Italian vocabulary and expressions through fun, interactive lessons. With AI-powered explanations and smart spaced repetition, you will build the confidence to use Italian in real life.",
    metaTitle: "Learn Italian Online Free - Interactive Lessons & Smart Repetition",
    metaDescription:
      "Start learning Italian today with free interactive lessons. Yiya's AI explanations and FSRS spaced repetition help you master Italian vocabulary and grammar effortlessly.",
    keywords: [
      "learn italian online",
      "italian lessons free",
      "italian vocabulary practice",
      "italian for beginners",
      "italian for travel",
    ],
    samplePhrases: [
      { original: "Buongiorno", translation: "Good morning" },
      { original: "Come stai?", translation: "How are you?" },
      { original: "Mi chiamo...", translation: "My name is..." },
      { original: "Per favore", translation: "Please" },
      { original: "Quanto costa?", translation: "How much does it cost?" },
    ],
    features: [
      {
        title: "Italian for Travel",
        description:
          "Master the phrases you need for ordering at restaurants, asking for directions, and navigating Italian culture with confidence.",
      },
      {
        title: "Italian Verb Conjugation",
        description:
          "Practice -are, -ere, and -ire verb patterns with interactive challenges. AI explanations make irregular verbs less intimidating.",
      },
      {
        title: "Cultural Context",
        description:
          "Learn vocabulary with cultural notes that help you understand when and how to use expressions like a native speaker.",
      },
    ],
    faqs: [
      {
        question: "Is Yiya free to learn Italian?",
        answer:
          "Yes! Yiya offers free Italian lessons with interactive exercises, AI explanations, and spaced repetition. Start learning immediately without a credit card.",
      },
      {
        question: "Can I learn Italian for travel purposes?",
        answer:
          "Absolutely. Yiya's Italian course includes practical travel vocabulary: ordering food, asking for directions, shopping, and social interactions. Perfect for preparing for a trip to Italy.",
      },
      {
        question: "How similar is Italian to Spanish?",
        answer:
          "Italian and Spanish share Latin roots, so if you know one, the other is easier. Yiya's AI explanations highlight these connections and differences, helping you learn faster if you already speak Spanish.",
      },
      {
        question: "How does the spaced repetition work for Italian?",
        answer:
          "Yiya uses the FSRS algorithm to track your memory strength for each Italian word and phrase. It schedules reviews right before you would forget, so you retain vocabulary efficiently with minimal study time.",
      },
      {
        question: "What level of Italian can I achieve?",
        answer:
          "Yiya builds a practical foundation in Italian vocabulary and basic grammar. With consistent daily practice, you can handle everyday conversations, travel situations, and basic written Italian within a few months.",
      },
    ],
  },
  {
    slug: "japanese",
    languageName: "Japanese",
    nativeName: "Nihongo",
    flagCode: "jp",
    heroTitle: "Learn Japanese Online",
    heroHighlight: "Your journey to Japanese starts here.",
    heroDescription:
      "Dive into Japanese with interactive lessons that teach vocabulary, hiragana, and practical expressions. Yiya's AI-powered explanations break down complex concepts, and spaced repetition ensures you never forget what you learn.",
    metaTitle: "Learn Japanese Online Free - Hiragana, Vocabulary & AI Lessons",
    metaDescription:
      "Start learning Japanese today with free interactive lessons. Master hiragana, vocabulary, and grammar with AI-powered explanations and FSRS spaced repetition.",
    keywords: [
      "learn japanese online",
      "japanese lessons free",
      "learn hiragana",
      "japanese for beginners",
      "japanese vocabulary practice",
    ],
    samplePhrases: [
      {
        original: "\u3053\u3093\u306b\u3061\u306f",
        translation: "Hello",
        romanization: "konnichiwa",
      },
      {
        original: "\u3042\u308a\u304c\u3068\u3046",
        translation: "Thank you",
        romanization: "arigatou",
      },
      {
        original: "\u3059\u307f\u307e\u305b\u3093",
        translation: "Excuse me",
        romanization: "sumimasen",
      },
      {
        original: "\u304a\u306f\u3088\u3046\u3054\u3056\u3044\u307e\u3059",
        translation: "Good morning",
        romanization: "ohayou gozaimasu",
      },
      {
        original: "\u3044\u304f\u3089\u3067\u3059\u304b\uff1f",
        translation: "How much is it?",
        romanization: "ikura desu ka?",
      },
    ],
    features: [
      {
        title: "Hiragana and Katakana",
        description:
          "Build a solid foundation in Japanese writing systems through repeated practice and AI-powered guidance on stroke order and recognition.",
      },
      {
        title: "Essential Japanese Grammar",
        description:
          "Learn sentence patterns and particles through interactive challenges. AI explanations clarify the nuances that textbooks gloss over.",
      },
      {
        title: "Practical Japanese Phrases",
        description:
          "Focus on expressions for real-life situations: shopping, dining, travel, and polite conversation in Japanese culture.",
      },
    ],
    faqs: [
      {
        question: "Is Yiya free to learn Japanese?",
        answer:
          "Yes! Start learning Japanese for free with Yiya. Access interactive lessons, AI explanations, and spaced repetition without any cost or credit card.",
      },
      {
        question: "Do I need to know hiragana before starting?",
        answer:
          "Not at all. Yiya's Japanese course teaches hiragana alongside vocabulary, with romanization provided for every phrase. You will learn the writing system naturally as you progress through lessons.",
      },
      {
        question: "Is Japanese hard to learn?",
        answer:
          "Japanese has unique features like three writing systems and different grammar structure, but Yiya breaks everything into small, manageable lessons. The AI explanations provide clear context for every mistake, and spaced repetition reinforces what you learn.",
      },
      {
        question: "How does Yiya handle kanji?",
        answer:
          "Yiya introduces common kanji gradually within context. The spaced repetition system ensures you review characters at optimal intervals, building recognition over time without overwhelming you.",
      },
      {
        question: "Can I prepare for a trip to Japan with Yiya?",
        answer:
          "Yes! The course includes practical travel vocabulary: ordering food, getting directions, shopping, and basic polite expressions that will serve you well in Japan.",
      },
    ],
  },
  {
    slug: "english",
    languageName: "English",
    nativeName: "English",
    flagCode: "en",
    heroTitle: "Learn English Online",
    heroHighlight: "Master English step by step.",
    heroDescription:
      "Improve your English vocabulary and grammar with interactive lessons designed for practical communication. Yiya's AI explanations help you understand grammar rules and usage, while spaced repetition keeps your knowledge fresh.",
    metaTitle: "Learn English Online Free - Vocabulary, Grammar & AI Lessons",
    metaDescription:
      "Start learning English today with free interactive lessons. Improve vocabulary, grammar, and comprehension with AI-powered explanations and FSRS spaced repetition.",
    keywords: [
      "learn english online",
      "english lessons free",
      "english vocabulary practice",
      "english grammar practice",
      "learn english app",
    ],
    samplePhrases: [
      { original: "How are you doing?", translation: "Greeting someone casually" },
      { original: "Could you help me, please?", translation: "Asking for help politely" },
      { original: "I would like to order...", translation: "Ordering at a restaurant" },
      { original: "What time is it?", translation: "Asking about time" },
      { original: "Nice to meet you!", translation: "Greeting someone new" },
    ],
    features: [
      {
        title: "English Grammar in Context",
        description:
          "Learn tenses, articles, and prepositions through practical exercises. AI explanations break down rules with clear examples when you make mistakes.",
      },
      {
        title: "Everyday English Vocabulary",
        description:
          "Build vocabulary for work, travel, and social situations. Spaced repetition ensures you remember words long after you learn them.",
      },
      {
        title: "Reading Comprehension",
        description:
          "Strengthen your ability to understand written English through varied challenge types that test both vocabulary and contextual understanding.",
      },
    ],
    faqs: [
      {
        question: "Is Yiya free to learn English?",
        answer:
          "Yes! Yiya offers free English lessons with interactive exercises, AI-powered explanations, and scientifically-backed spaced repetition. No credit card needed.",
      },
      {
        question: "What level of English does Yiya teach?",
        answer:
          "Yiya starts from basics and progresses to intermediate vocabulary and grammar. Whether you are a beginner or looking to strengthen your foundation, the adaptive spaced repetition adjusts to your level.",
      },
      {
        question: "How is Yiya different from other English learning apps?",
        answer:
          "Yiya uses AI to explain exactly why an answer is wrong, not just show the correct one. Combined with FSRS spaced repetition that optimizes your review schedule, you learn more efficiently and retain more.",
      },
      {
        question: "Can I use Yiya to prepare for English exams?",
        answer:
          "While Yiya is not specifically an exam prep tool, the vocabulary and grammar practice will strengthen your English foundation. The spaced repetition system is especially effective for building the kind of deep vocabulary knowledge that exams test.",
      },
      {
        question: "How much time do I need to spend daily?",
        answer:
          "Even 10-15 minutes of daily practice on Yiya can produce noticeable improvement. Consistency matters more than session length. The streak system helps you build a daily habit.",
      },
    ],
  },
];

export function getLanguageBySlug(slug: string): LanguagePageData | undefined {
  return LANGUAGE_PAGES.find((lang) => lang.slug === slug);
}

export function getAllLanguageSlugs(): string[] {
  return LANGUAGE_PAGES.map((lang) => lang.slug);
}
