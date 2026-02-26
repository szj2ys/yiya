import type { FAQ } from "./languages";

export interface TopicPageData {
  slug: string;
  languageSlug: string;
  languageName: string;
  title: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: ContentSection[];
  faqs: FAQ[];
}

export interface ContentSection {
  heading: string;
  body: string;
}

export const TOPIC_PAGES: TopicPageData[] = [
  {
    slug: "hiragana",
    languageSlug: "japanese",
    languageName: "Japanese",
    title: "Learn Japanese Hiragana",
    heroTitle: "Learn Japanese Hiragana",
    heroHighlight: "Master the foundation of Japanese writing.",
    heroDescription:
      "Hiragana is the first step to reading Japanese. Yiya teaches all 46 basic hiragana characters through interactive exercises with AI-powered explanations that help you remember each character and its sound.",
    metaTitle: "Learn Japanese Hiragana Online Free - Interactive Practice",
    metaDescription:
      "Master all 46 hiragana characters with free interactive lessons. Yiya uses AI explanations and spaced repetition to help you learn Japanese hiragana faster and remember it longer.",
    keywords: [
      "learn hiragana",
      "japanese hiragana practice",
      "hiragana for beginners",
      "hiragana chart",
      "learn japanese writing",
    ],
    content: [
      {
        heading: "What Is Hiragana?",
        body: "Hiragana is one of three Japanese writing systems and the most fundamental one for beginners. It consists of 46 basic characters, each representing a syllable. Unlike kanji, which represents meaning, hiragana represents sound -- making it the perfect starting point for learning to read and write Japanese. Once you master hiragana, you can read most beginner-level Japanese texts and children's books, sound out unfamiliar words, and begin understanding the basic structure of written Japanese.",
      },
      {
        heading: "Why Start with Hiragana?",
        body: "Every Japanese learner needs hiragana. It is used for native Japanese words, grammatical particles, verb endings, and as reading aids (furigana) above kanji characters. Learning hiragana first gives you the tools to progress to katakana and kanji with confidence. Many learners try to skip hiragana and rely on romanization, but this creates a ceiling that limits progress later. Investing a few weeks in hiragana now pays dividends for years of Japanese study.",
      },
      {
        heading: "How Yiya Teaches Hiragana",
        body: "Yiya breaks hiragana into manageable groups, starting with the five vowels (a, i, u, e, o) and building systematically. Each lesson introduces new characters through multiple challenge types: visual recognition, sound matching, and recall exercises. When you make a mistake, the AI does not just mark it wrong -- it explains the character, its stroke order, and common mix-ups with similar-looking characters. The FSRS spaced repetition system then schedules reviews at scientifically optimal intervals so each character moves from short-term to long-term memory.",
      },
    ],
    faqs: [
      {
        question: "How long does it take to learn hiragana?",
        answer:
          "With consistent daily practice on Yiya, most learners can recognize all 46 hiragana characters within 2-3 weeks. The spaced repetition system ensures you retain them long-term, not just for a quiz.",
      },
      {
        question: "Should I learn hiragana or katakana first?",
        answer:
          "Start with hiragana. It is more commonly used in everyday Japanese and provides the foundation for grammar and reading. Katakana can be learned afterwards -- the same 46 sounds, just different character shapes.",
      },
      {
        question: "Is hiragana hard to learn?",
        answer:
          "Hiragana is considered one of the easier aspects of Japanese. Each character represents one sound, making it phonetically consistent. Yiya's AI explanations help with commonly confused characters, and spaced repetition prevents forgetting.",
      },
    ],
  },
  {
    slug: "verb-conjugation",
    languageSlug: "spanish",
    languageName: "Spanish",
    title: "Spanish Verb Conjugation Practice",
    heroTitle: "Spanish Verb Conjugation Practice",
    heroHighlight: "Conjugate with confidence.",
    heroDescription:
      "Spanish verb conjugation is the key to forming sentences. Yiya helps you practice regular and irregular verb patterns through interactive challenges with instant AI feedback on every mistake.",
    metaTitle: "Spanish Verb Conjugation Practice Online Free - AI Feedback",
    metaDescription:
      "Practice Spanish verb conjugation with free interactive exercises. Get AI-powered explanations for every mistake and master regular and irregular verb patterns with spaced repetition.",
    keywords: [
      "spanish verb conjugation",
      "spanish verb practice",
      "conjugate spanish verbs",
      "spanish irregular verbs",
      "spanish verb tenses",
    ],
    content: [
      {
        heading: "Why Verb Conjugation Matters in Spanish",
        body: "In Spanish, the verb ending changes based on who is performing the action and when it happens. Unlike English, where we rely heavily on helper words like 'will' or 'have,' Spanish packs this information directly into the verb form. Mastering conjugation is essential because it allows you to express yourself clearly -- saying 'hablo' (I speak) versus 'hablas' (you speak) versus 'hablamos' (we speak) requires knowing the right ending for each subject pronoun.",
      },
      {
        heading: "Regular vs. Irregular Verbs",
        body: "Spanish verbs fall into three groups based on their infinitive endings: -ar (hablar), -er (comer), and -ir (vivir). Regular verbs follow predictable patterns within each group, making them straightforward once you learn the rules. Irregular verbs like ser, estar, ir, and tener break these patterns and need extra practice. Yiya's spaced repetition targets irregular verbs with more frequent reviews, ensuring these tricky forms stick in your memory.",
      },
      {
        heading: "How Yiya Makes Conjugation Easier",
        body: "Instead of memorizing conjugation tables, Yiya teaches verb forms in context through interactive exercises. When you conjugate incorrectly, the AI explains the specific rule you missed -- whether it is a stem change, an irregular yo form, or a tense selection error. This learn-from-mistakes approach is far more effective than rote memorization. The FSRS algorithm tracks which verb forms you struggle with and increases review frequency for those specific patterns.",
      },
    ],
    faqs: [
      {
        question: "How many Spanish verb tenses do I need to know?",
        answer:
          "For everyday conversation, focus on present, preterite (simple past), and future tenses first. Yiya introduces tenses progressively, so you build competence step by step without being overwhelmed.",
      },
      {
        question: "What are the hardest Spanish verbs to conjugate?",
        answer:
          "Ser and estar (both meaning 'to be'), ir (to go), and tener (to have) are among the most irregular and frequently used. Yiya gives these verbs extra attention with targeted practice and AI explanations.",
      },
      {
        question: "How does AI help with verb conjugation?",
        answer:
          "When you make a conjugation error, Yiya's AI explains exactly what went wrong: whether you mixed up the tense, used the wrong stem change, or confused a regular pattern with an irregular one. This targeted feedback accelerates learning.",
      },
    ],
  },
  {
    slug: "characters-for-beginners",
    languageSlug: "chinese",
    languageName: "Chinese",
    title: "Chinese Characters for Beginners",
    heroTitle: "Chinese Characters for Beginners",
    heroHighlight: "Start reading Chinese today.",
    heroDescription:
      "Chinese characters may look daunting, but with the right approach they become manageable. Yiya introduces characters gradually with AI explanations that break down radicals, stroke order, and meaning so you build recognition naturally.",
    metaTitle: "Learn Chinese Characters for Beginners - Free Interactive Lessons",
    metaDescription:
      "Start learning Chinese characters with free interactive lessons. Yiya breaks down radicals, meaning, and stroke order with AI explanations and spaced repetition for lasting retention.",
    keywords: [
      "chinese characters for beginners",
      "learn chinese characters",
      "basic chinese characters",
      "chinese radicals",
      "mandarin characters practice",
    ],
    content: [
      {
        heading: "Getting Started with Chinese Characters",
        body: "Chinese characters (hanzi) are the building blocks of written Chinese. While there are thousands of characters in total, you only need about 500-1000 to read everyday texts like menus, signs, and simple articles. Each character represents a meaning (and often a syllable), and many characters share common components called radicals. Learning to recognize radicals is like learning the alphabet -- it gives you tools to decode unfamiliar characters.",
      },
      {
        heading: "The Radical System",
        body: "Radicals are recurring components that appear in many characters. For example, the water radical appears in characters related to liquids, rivers, and swimming. The person radical appears in characters about human activities. Recognizing these patterns helps you guess meanings of new characters and makes memorization much easier. Yiya teaches common radicals alongside characters, giving you a framework for understanding rather than pure memorization.",
      },
      {
        heading: "How Yiya Teaches Characters",
        body: "Yiya introduces characters in order of frequency and usefulness, starting with the most common ones you will encounter daily. Each character is taught through multiple challenge types: recognition, meaning recall, and contextual usage. When you confuse similar-looking characters, the AI highlights the specific differences and explains the radicals involved. The FSRS spaced repetition system schedules reviews based on your individual memory patterns, so characters move into long-term memory efficiently.",
      },
    ],
    faqs: [
      {
        question: "How many Chinese characters do I need to learn?",
        answer:
          "About 500 characters cover roughly 80% of everyday written Chinese. Yiya focuses on the most frequent characters first, so you gain practical reading ability as quickly as possible.",
      },
      {
        question: "Are Chinese characters hard to remember?",
        answer:
          "Characters require more repetition than alphabetic letters, but Yiya's FSRS spaced repetition is specifically designed for this challenge. By reviewing characters at optimal intervals, you build lasting recognition without excessive study time.",
      },
      {
        question: "Should I learn simplified or traditional characters?",
        answer:
          "Yiya teaches simplified characters, which are used in mainland China and are the standard for most Mandarin learners. They have fewer strokes, making them faster to learn and write.",
      },
    ],
  },
  {
    slug: "pronunciation",
    languageSlug: "french",
    languageName: "French",
    title: "French Pronunciation Practice",
    heroTitle: "French Pronunciation Practice",
    heroHighlight: "Sound French from day one.",
    heroDescription:
      "French pronunciation has unique rules that differ significantly from English. Yiya helps you master nasal vowels, liaison, and silent letters through interactive exercises with AI-powered explanations for every mistake.",
    metaTitle: "French Pronunciation Practice Online Free - AI-Powered Lessons",
    metaDescription:
      "Improve your French pronunciation with free interactive lessons. Master nasal vowels, liaison, and silent letters with AI explanations and spaced repetition practice.",
    keywords: [
      "french pronunciation practice",
      "french pronunciation guide",
      "how to pronounce french",
      "french sounds",
      "french accent practice",
    ],
    content: [
      {
        heading: "Why French Pronunciation Matters",
        body: "French pronunciation is often cited as one of the trickier aspects of the language for English speakers. Silent final consonants, nasal vowels, and the French 'r' sound can feel unfamiliar at first. But pronunciation is not just about sounding nice -- it directly affects comprehension. Mispronouncing a word can change its meaning entirely, and understanding spoken French requires knowing how words actually sound, not just how they are spelled.",
      },
      {
        heading: "Key French Sounds for English Speakers",
        body: "Several French sounds do not exist in English: the nasal vowels (in, on, an, un), the French 'u' (as in 'tu'), and the uvular 'r'. Additionally, French has liaison rules where a normally silent consonant is pronounced when the next word begins with a vowel. These patterns become intuitive with practice, but they need explicit attention early in your learning journey. Yiya's exercises target these specific sounds with focused practice sessions.",
      },
      {
        heading: "How Yiya Improves Your Pronunciation",
        body: "Yiya uses listening and recognition challenges to train your ear for French sounds. When you make a mistake involving pronunciation-related vocabulary or confuse words that sound similar, the AI explains the specific sound differences and pronunciation rules involved. Over time, spaced repetition reinforces these distinctions so they become second nature. The combination of visual, audio, and contextual learning creates multiple memory pathways for each pronunciation pattern.",
      },
    ],
    faqs: [
      {
        question: "How long does it take to improve French pronunciation?",
        answer:
          "Most learners notice significant improvement within 3-4 weeks of daily practice. The key is consistent exposure to French sounds combined with targeted feedback, which is exactly what Yiya provides.",
      },
      {
        question: "Why are French silent letters so confusing?",
        answer:
          "French spelling preserves historical letter combinations even when pronunciation has evolved. Yiya's AI explains these patterns so you can predict which letters are silent and when they are pronounced (like in liaison).",
      },
      {
        question: "Can I learn French pronunciation without a tutor?",
        answer:
          "Yes. Yiya's interactive exercises and AI explanations provide targeted feedback similar to a tutor. The spaced repetition system ensures you practice the sounds you find most challenging more frequently.",
      },
    ],
  },
  {
    slug: "for-travel",
    languageSlug: "italian",
    languageName: "Italian",
    title: "Italian for Travel",
    heroTitle: "Italian for Travel",
    heroHighlight: "Be ready for your Italian adventure.",
    heroDescription:
      "Planning a trip to Italy? Learn the essential Italian phrases for restaurants, hotels, directions, and shopping. Yiya's interactive lessons prepare you for real conversations with AI-powered help when you get stuck.",
    metaTitle: "Learn Italian for Travel - Free Phrases & Interactive Practice",
    metaDescription:
      "Learn essential Italian travel phrases with free interactive lessons. Master restaurant ordering, directions, shopping, and hotel vocabulary with AI explanations and spaced repetition.",
    keywords: [
      "italian for travel",
      "travel italian phrases",
      "italian for tourists",
      "basic italian for travel",
      "learn italian before trip",
    ],
    content: [
      {
        heading: "Essential Italian for Your Trip",
        body: "Italy is one of the world's most popular travel destinations, and knowing even basic Italian transforms the experience. Locals appreciate the effort, and you gain access to authentic restaurants, hidden gems, and meaningful conversations that tourists who only speak English often miss. From ordering the perfect gelato to navigating the train system, a small Italian vocabulary goes a remarkably long way.",
      },
      {
        heading: "Key Phrases for Travelers",
        body: "Focus on these essential categories: greetings (buongiorno, buonasera, ciao), restaurant phrases (il conto per favore, vorrei ordinare), directions (dove si trova, a destra, a sinistra), shopping (quanto costa, posso provare), and polite expressions (grazie, prego, mi scusi). These cover roughly 80% of tourist interactions and can be learned in a few focused weeks of practice on Yiya.",
      },
      {
        heading: "How Yiya Prepares You for Travel",
        body: "Yiya's Italian lessons prioritize practical vocabulary that you will actually use. Unlike phrasebooks that you flip through in a panic, Yiya's spaced repetition means the phrases are in your memory when you need them. The AI explanations help you understand the grammar behind each phrase so you can adapt them to different situations -- not just parrot memorized sentences. This gives you the flexibility to handle unexpected conversations with confidence.",
      },
    ],
    faqs: [
      {
        question: "How much Italian do I need for a trip to Italy?",
        answer:
          "Even 50-100 key phrases will significantly improve your travel experience. Yiya focuses on the most practical travel vocabulary first, so you can be conversation-ready in just a few weeks of daily practice.",
      },
      {
        question: "Can I learn enough Italian in 2 weeks before my trip?",
        answer:
          "Absolutely. Two weeks of consistent practice on Yiya (15-20 minutes daily) is enough to learn essential greetings, restaurant phrases, and basic questions. The spaced repetition ensures you remember them when you arrive.",
      },
      {
        question: "Do Italians expect tourists to speak Italian?",
        answer:
          "Italians generally appreciate any effort to speak their language. Even basic phrases like 'buongiorno' and 'grazie' earn goodwill. In tourist areas, many Italians speak English, but knowing Italian opens doors to more authentic experiences.",
      },
    ],
  },
  {
    slug: "vocabulary-for-beginners",
    languageSlug: "english",
    languageName: "English",
    title: "English Vocabulary for Beginners",
    heroTitle: "English Vocabulary for Beginners",
    heroHighlight: "Build your English word power.",
    heroDescription:
      "Start building your English vocabulary from the ground up. Yiya teaches the most useful everyday words through interactive exercises, with AI explanations that help you understand meaning, usage, and common mistakes.",
    metaTitle: "English Vocabulary for Beginners - Free Interactive Lessons",
    metaDescription:
      "Build essential English vocabulary with free interactive lessons. Learn everyday words and phrases with AI-powered explanations and spaced repetition for lasting retention.",
    keywords: [
      "english vocabulary for beginners",
      "basic english words",
      "learn english vocabulary",
      "english words for beginners",
      "everyday english vocabulary",
    ],
    content: [
      {
        heading: "Building a Strong English Vocabulary Foundation",
        body: "English has one of the largest vocabularies of any language, but you do not need to know all of it. Research shows that the most common 1000 words cover about 85% of everyday conversation. Yiya focuses on these high-frequency words first, giving you the biggest return on your study time. By learning the right words in the right order, you can start understanding and participating in English conversations much sooner than you might think.",
      },
      {
        heading: "Learning Words in Context",
        body: "Memorizing word lists is inefficient because words gain meaning from context. Yiya teaches vocabulary through sentences and situations, so you learn not just what a word means but when and how to use it. For example, learning 'run' in the context of 'run a meeting' versus 'run a mile' teaches you that English words often have multiple meanings. The AI explanations highlight these nuances whenever they come up.",
      },
      {
        heading: "How Yiya Builds Vocabulary Efficiently",
        body: "Yiya combines three powerful techniques: contextual learning (words in sentences), multiple challenge types (recognition, recall, and spelling), and FSRS spaced repetition (reviewing words at optimal intervals). When you confuse similar words or make a usage error, the AI provides a clear explanation of the difference. This multi-angle approach creates stronger memory connections than any single method alone.",
      },
    ],
    faqs: [
      {
        question: "How many English words do I need to know?",
        answer:
          "About 1000 words cover 85% of everyday English conversation. Yiya teaches these high-frequency words first, so you gain practical communication ability as quickly as possible.",
      },
      {
        question: "What is the fastest way to build English vocabulary?",
        answer:
          "Consistent daily practice with spaced repetition is the most efficient method. Yiya's FSRS algorithm ensures you review words right before you would forget them, maximizing retention with minimum study time.",
      },
      {
        question: "How does Yiya help with words that have multiple meanings?",
        answer:
          "When a word appears in different contexts, Yiya's AI explains the specific meaning being used. Over time, you encounter common words in multiple situations, building a rich understanding of how English words work in practice.",
      },
    ],
  },
  {
    slug: "basic-greetings",
    languageSlug: "spanish",
    languageName: "Spanish",
    title: "Basic Spanish Greetings",
    heroTitle: "Basic Spanish Greetings",
    heroHighlight: "Start every conversation right.",
    heroDescription:
      "Spanish greetings are your gateway to conversation. Learn the essential greetings, introductions, and polite expressions with interactive practice and AI-powered feedback that helps you use them naturally.",
    metaTitle: "Learn Basic Spanish Greetings - Free Interactive Practice",
    metaDescription:
      "Master Spanish greetings and introductions with free interactive lessons. Learn hola, buenos dias, and polite phrases with AI explanations and spaced repetition.",
    keywords: [
      "spanish greetings",
      "basic spanish phrases",
      "hello in spanish",
      "spanish introductions",
      "spanish polite expressions",
    ],
    content: [
      {
        heading: "Essential Spanish Greetings",
        body: "Spanish greetings vary by time of day and formality. 'Buenos dias' (good morning), 'buenas tardes' (good afternoon), and 'buenas noches' (good evening/night) cover most situations. The casual 'hola' works anytime with friends and peers. Knowing which greeting to use shows cultural awareness and sets a positive tone for any interaction. In Spanish-speaking cultures, greetings are more than small talk -- they are an important social ritual.",
      },
      {
        heading: "Introductions and Polite Phrases",
        body: "After greeting someone, you will want to introduce yourself: 'Me llamo...' (My name is...) or 'Soy...' (I am...). Key polite phrases include 'mucho gusto' (nice to meet you), 'por favor' (please), 'gracias' (thank you), and 'de nada' (you are welcome). These expressions form the backbone of polite Spanish conversation and are used dozens of times in every social interaction.",
      },
      {
        heading: "Practice Makes Natural",
        body: "Yiya teaches greetings through interactive exercises where you practice in simulated conversation contexts. When you mix up formal and informal forms or use the wrong time-based greeting, the AI explains the social context and usage rules. Spaced repetition ensures these fundamental phrases become automatic -- you will reach for 'buenos dias' without thinking, just like you say 'good morning' in English.",
      },
    ],
    faqs: [
      {
        question: "What is the most common Spanish greeting?",
        answer:
          "'Hola' (hello) is the most universal Spanish greeting, appropriate in almost any casual situation. For more formal contexts, use time-based greetings: 'buenos dias,' 'buenas tardes,' or 'buenas noches.'",
      },
      {
        question: "When do I use tu vs. usted?",
        answer:
          "Use 'tu' with friends, peers, and younger people. Use 'usted' with strangers, elders, and in professional settings. Yiya's AI explains these distinctions when they appear in exercises, helping you develop natural formality awareness.",
      },
      {
        question: "How quickly can I learn basic Spanish greetings?",
        answer:
          "You can learn the essential Spanish greetings in your first Yiya session -- about 10-15 minutes. Spaced repetition then reinforces them over the following days so they become second nature.",
      },
    ],
  },
  {
    slug: "katakana",
    languageSlug: "japanese",
    languageName: "Japanese",
    title: "Learn Japanese Katakana",
    heroTitle: "Learn Japanese Katakana",
    heroHighlight: "Unlock foreign words in Japanese.",
    heroDescription:
      "Katakana is used for foreign loanwords, names, and emphasis in Japanese. Yiya teaches all 46 katakana characters through interactive practice with AI guidance, building on your hiragana foundation.",
    metaTitle: "Learn Japanese Katakana Online Free - Interactive Lessons",
    metaDescription:
      "Master all 46 katakana characters with free interactive lessons. Yiya uses AI explanations and FSRS spaced repetition to help you learn katakana effectively.",
    keywords: [
      "learn katakana",
      "japanese katakana practice",
      "katakana for beginners",
      "katakana chart",
      "katakana vs hiragana",
    ],
    content: [
      {
        heading: "What Is Katakana?",
        body: "Katakana is the second of Japan's two phonetic writing systems, alongside hiragana. While hiragana is used for native Japanese words, katakana is primarily used for foreign loanwords (like 'koohii' for coffee), scientific terms, onomatopoeia, and emphasis. It uses the same 46 sounds as hiragana but with different, more angular character shapes. Learning katakana opens up a huge portion of modern Japanese vocabulary, especially technology, food, and pop culture terms.",
      },
      {
        heading: "Katakana vs. Hiragana",
        body: "Both systems represent the same 46 sounds, but they serve different purposes. Think of it like the difference between lowercase and uppercase letters in English -- same sounds, different visual forms, used in different contexts. Katakana characters tend to be more angular and straight compared to hiragana's curves. If you already know hiragana, learning katakana is mainly about memorizing the new character shapes for sounds you already recognize.",
      },
      {
        heading: "How Yiya Teaches Katakana",
        body: "Yiya introduces katakana alongside common loanwords, so you learn characters in meaningful context. The AI highlights the connection between katakana and hiragana equivalents, making the learning process faster if you already know hiragana. When you confuse similar-looking characters, the AI points out the specific visual differences. FSRS spaced repetition ensures each character is reviewed at the optimal time for your memory.",
      },
    ],
    faqs: [
      {
        question: "Should I learn katakana after hiragana?",
        answer:
          "Yes, most learners study hiragana first, then katakana. Since both systems share the same sounds, learning katakana is faster once you have a hiragana foundation. Yiya supports this progression naturally.",
      },
      {
        question: "How long does it take to learn katakana?",
        answer:
          "If you already know hiragana, katakana typically takes 1-2 weeks of consistent practice. The characters are new but the sounds are familiar, which significantly speeds up the process.",
      },
      {
        question: "Is katakana harder than hiragana?",
        answer:
          "Katakana is often considered slightly harder because its characters are more angular and some look quite similar. However, Yiya's AI specifically helps with commonly confused katakana pairs, and spaced repetition reinforces the distinctions.",
      },
    ],
  },
  {
    slug: "tones-and-pinyin",
    languageSlug: "chinese",
    languageName: "Chinese",
    title: "Chinese Tones and Pinyin",
    heroTitle: "Chinese Tones and Pinyin",
    heroHighlight: "Get the tones right from the start.",
    heroDescription:
      "Mandarin Chinese has four tones that can change a word's meaning entirely. Yiya helps you master pinyin and tones through interactive exercises with AI explanations that make this challenging aspect of Chinese approachable.",
    metaTitle: "Learn Chinese Tones and Pinyin - Free Interactive Practice",
    metaDescription:
      "Master Mandarin tones and pinyin with free interactive lessons. Yiya uses AI-powered explanations to help you distinguish and produce the four Chinese tones correctly.",
    keywords: [
      "chinese tones",
      "learn pinyin",
      "mandarin tones practice",
      "chinese pronunciation",
      "pinyin for beginners",
    ],
    content: [
      {
        heading: "Understanding Mandarin Tones",
        body: "Mandarin Chinese is a tonal language with four main tones plus a neutral tone. The same syllable pronounced with different tones has completely different meanings: 'ma' can mean mother (first tone), hemp (second tone), horse (third tone), or scold (fourth tone). This is one of the most important aspects of Chinese to learn early because tone errors can cause genuine misunderstandings in conversation.",
      },
      {
        heading: "What Is Pinyin?",
        body: "Pinyin is the standard romanization system for Mandarin Chinese. It uses Latin letters with tone marks to represent Chinese pronunciation. For example, 'ni hao' (hello) is written as 'ni hao' in pinyin with appropriate tone marks. Pinyin serves as a bridge between the Latin alphabet you already know and Chinese characters, and it is essential for typing Chinese on phones and computers. Most Chinese learners use pinyin as their primary pronunciation guide.",
      },
      {
        heading: "How Yiya Teaches Tones",
        body: "Yiya integrates tone practice into every Chinese lesson rather than treating it as a separate topic. When you encounter a new word, you see both the character and its pinyin with tone marks. Listening exercises train your ear to distinguish between tones, and when you confuse tones in an exercise, the AI explains the specific tone difference and provides memory aids. FSRS spaced repetition pays special attention to tone-related errors, scheduling extra review for words whose tones you find tricky.",
      },
    ],
    faqs: [
      {
        question: "How hard are Chinese tones to learn?",
        answer:
          "Tones feel challenging at first because most European languages do not use them. However, with consistent practice on Yiya, most learners develop reliable tone recognition within a few weeks. The key is daily exposure combined with AI feedback on errors.",
      },
      {
        question: "Do I need to learn pinyin?",
        answer:
          "Yes, pinyin is essential for Chinese learners. It is used for typing Chinese on all devices, looking up words in dictionaries, and as a pronunciation guide. Yiya teaches pinyin alongside characters from the very first lesson.",
      },
      {
        question: "What happens if I use the wrong tone?",
        answer:
          "Using the wrong tone can change a word's meaning entirely, which is why Yiya emphasizes tone accuracy from the start. The AI explains tone differences whenever you make a mistake, helping you build awareness before bad habits form.",
      },
    ],
  },
  {
    slug: "everyday-phrases",
    languageSlug: "french",
    languageName: "French",
    title: "Everyday French Phrases",
    heroTitle: "Everyday French Phrases",
    heroHighlight: "Speak French in daily life.",
    heroDescription:
      "Learn the French phrases you will use every day -- from cafe orders to polite requests. Yiya teaches practical vocabulary in context with AI-powered explanations that help you understand usage, not just translation.",
    metaTitle: "Learn Everyday French Phrases - Free Interactive Lessons",
    metaDescription:
      "Master essential everyday French phrases with free interactive lessons. Learn practical vocabulary for daily life with AI explanations and spaced repetition.",
    keywords: [
      "everyday french phrases",
      "common french expressions",
      "useful french phrases",
      "french daily conversation",
      "practical french vocabulary",
    ],
    content: [
      {
        heading: "French Phrases for Daily Life",
        body: "Everyday French revolves around a core set of phrases that appear in nearly every interaction. 'S'il vous plait' (please), 'merci' (thank you), 'excusez-moi' (excuse me), and 'je voudrais...' (I would like...) cover a surprising number of daily situations. French culture places high value on politeness, so knowing these phrases is not just useful -- it is expected. Using them correctly immediately improves how French speakers perceive and respond to you.",
      },
      {
        heading: "At the Cafe, Market, and Beyond",
        body: "France's cafe culture means you will frequently need to order drinks and food: 'un cafe, s'il vous plait' (a coffee, please), 'l'addition' (the bill). At markets and shops: 'combien ca coute?' (how much does it cost?), 'je prends celui-ci' (I'll take this one). For getting around: 'ou est...?' (where is...?), 'a gauche' (to the left), 'a droite' (to the right). These situational phrases are the ones Yiya prioritizes because they have immediate practical value.",
      },
      {
        heading: "How Yiya Makes Phrases Stick",
        body: "Yiya teaches phrases in situational context rather than isolated word lists. You practice ordering, greeting, and navigating through interactive exercises that simulate real scenarios. When you make errors, the AI explains not just the correct phrase but the cultural context: when to use vous versus tu, when to say 'bonsoir' instead of 'bonjour,' and how French politeness conventions differ from English. FSRS spaced repetition then ensures these phrases are available in your memory when you need them.",
      },
    ],
    faqs: [
      {
        question: "What are the most important French phrases to learn first?",
        answer:
          "Start with greetings (bonjour, bonsoir), politeness (s'il vous plait, merci), and basic needs (je voudrais, ou est, combien). These cover the majority of everyday interactions and can be learned in your first week on Yiya.",
      },
      {
        question: "How is spoken French different from written French?",
        answer:
          "Spoken French drops many sounds that are written, and uses more contractions and informal expressions. Yiya's exercises include both formal and casual forms, with AI explanations highlighting the differences between spoken and written French.",
      },
      {
        question: "Can I learn enough French phrases for a trip?",
        answer:
          "Absolutely. Two to three weeks of daily practice on Yiya can give you enough phrases for a comfortable trip to France. The spaced repetition ensures the phrases are fresh in your memory when you arrive.",
      },
    ],
  },
];

export function getTopicBySlug(
  languageSlug: string,
  topicSlug: string,
): TopicPageData | undefined {
  return TOPIC_PAGES.find(
    (topic) => topic.languageSlug === languageSlug && topic.slug === topicSlug,
  );
}

export function getTopicsForLanguage(languageSlug: string): TopicPageData[] {
  return TOPIC_PAGES.filter((topic) => topic.languageSlug === languageSlug);
}

export function getAllTopicParams(): { lang: string; topic: string }[] {
  return TOPIC_PAGES.map((topic) => ({
    lang: topic.languageSlug,
    topic: topic.slug,
  }));
}
