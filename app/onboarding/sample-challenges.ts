export type SampleChallenge = {
  question: string;
  options: { text: string; correct: boolean }[];
  courseTitle: string;
};

const sampleChallenges: Record<string, SampleChallenge> = {
  Spanish: {
    question: "Which one means 'hello'?",
    courseTitle: "Spanish",
    options: [
      { text: "Hola", correct: true },
      { text: "Adiós", correct: false },
      { text: "Gracias", correct: false },
      { text: "Amigo", correct: false },
    ],
  },
  Italian: {
    question: "Which one means 'hello'?",
    courseTitle: "Italian",
    options: [
      { text: "Arrivederci", correct: false },
      { text: "Ciao", correct: true },
      { text: "Grazie", correct: false },
      { text: "Buono", correct: false },
    ],
  },
  French: {
    question: "Which one means 'hello'?",
    courseTitle: "French",
    options: [
      { text: "Merci", correct: false },
      { text: "Au revoir", correct: false },
      { text: "Bonjour", correct: true },
      { text: "Oui", correct: false },
    ],
  },
  Japanese: {
    question: "Which one means 'hello'?",
    courseTitle: "Japanese",
    options: [
      { text: "Sayonara", correct: false },
      { text: "Arigatou", correct: false },
      { text: "Sumimasen", correct: false },
      { text: "Konnichiwa", correct: true },
    ],
  },
  English: {
    question: "Which one means 'thank you'?",
    courseTitle: "English",
    options: [
      { text: "Goodbye", correct: false },
      { text: "Please", correct: false },
      { text: "Thank you", correct: true },
      { text: "Sorry", correct: false },
    ],
  },
  Chinese: {
    question: "Which one means 'hello'?",
    courseTitle: "Chinese",
    options: [
      { text: "Xièxie", correct: false },
      { text: "Nǐ hǎo", correct: true },
      { text: "Zàijiàn", correct: false },
      { text: "Duìbuqǐ", correct: false },
    ],
  },
};

export function getSampleChallenge(
  courseTitle: string,
): SampleChallenge | undefined {
  return sampleChallenges[courseTitle];
}

export { sampleChallenges };
