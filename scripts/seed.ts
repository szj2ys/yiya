import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "../db/schema";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore
const db = drizzle(sql, { schema });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChallengeType = "SELECT" | "ASSIST";

interface WordEntry {
  /** The word/phrase in the target language */
  word: string;
  /** The English meaning (used as question text) */
  meaning: string;
}

interface UnitTheme {
  title: string;
  description: string;
  lessonTitles: string[];
  /** Words for this unit, divided into 5 groups (one per lesson) */
  words: WordEntry[][];
}

interface LanguageConfig {
  title: string;
  imageSrc: string;
  units: UnitTheme[];
}

// ---------------------------------------------------------------------------
// Unit templates — shared structure across all languages
// ---------------------------------------------------------------------------

const UNIT_TEMPLATES: { title: string; description: string; lessonTitles: string[] }[] = [
  {
    title: "Unit 1",
    description: "Basics",
    lessonTitles: ["People & Family", "Numbers", "Colors", "Common Objects", "Basic Adjectives"],
  },
  {
    title: "Unit 2",
    description: "Daily Life",
    lessonTitles: ["Around the House", "Actions & Verbs", "Time & Days", "Clothing", "Body & Health"],
  },
  {
    title: "Unit 3",
    description: "Food & Drink",
    lessonTitles: ["Fruits & Vegetables", "Meals & Cooking", "Drinks", "At the Restaurant", "Tastes & Descriptions"],
  },
  {
    title: "Unit 4",
    description: "Travel",
    lessonTitles: ["Transportation", "Directions", "Places & Buildings", "Hotel & Accommodation", "Nature & Weather"],
  },
  {
    title: "Unit 5",
    description: "Conversation",
    lessonTitles: ["Greetings & Farewells", "Introductions", "Common Phrases", "Feelings & Emotions", "Polite Expressions"],
  },
];

// ---------------------------------------------------------------------------
// Language data — each language has 5 units, each unit has 5 lessons,
// each lesson has 2+ words → 50+ words per language
// ---------------------------------------------------------------------------

function buildSpanish(): LanguageConfig {
  return {
    title: "Spanish",
    imageSrc: "/es.svg",
    units: [
      {
        ...UNIT_TEMPLATES[0],
        description: "Learn the basics of Spanish",
        words: [
          // People & Family
          [
            { word: "el hombre", meaning: "the man" },
            { word: "la mujer", meaning: "the woman" },
            { word: "el niño", meaning: "the boy" },
            { word: "la niña", meaning: "the girl" },
            { word: "la madre", meaning: "the mother" },
          ],
          // Numbers
          [
            { word: "uno", meaning: "one" },
            { word: "dos", meaning: "two" },
            { word: "tres", meaning: "three" },
            { word: "cuatro", meaning: "four" },
            { word: "cinco", meaning: "five" },
          ],
          // Colors
          [
            { word: "rojo", meaning: "red" },
            { word: "azul", meaning: "blue" },
            { word: "verde", meaning: "green" },
            { word: "amarillo", meaning: "yellow" },
            { word: "negro", meaning: "black" },
          ],
          // Common Objects
          [
            { word: "el libro", meaning: "the book" },
            { word: "la mesa", meaning: "the table" },
            { word: "la silla", meaning: "the chair" },
            { word: "el teléfono", meaning: "the phone" },
            { word: "la llave", meaning: "the key" },
          ],
          // Basic Adjectives
          [
            { word: "grande", meaning: "big" },
            { word: "pequeño", meaning: "small" },
            { word: "bueno", meaning: "good" },
            { word: "malo", meaning: "bad" },
            { word: "nuevo", meaning: "new" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[1],
        description: "Daily life in Spanish",
        words: [
          // Around the House
          [
            { word: "la casa", meaning: "the house" },
            { word: "la cocina", meaning: "the kitchen" },
            { word: "el baño", meaning: "the bathroom" },
            { word: "la cama", meaning: "the bed" },
            { word: "la puerta", meaning: "the door" },
          ],
          // Actions & Verbs
          [
            { word: "comer", meaning: "to eat" },
            { word: "beber", meaning: "to drink" },
            { word: "dormir", meaning: "to sleep" },
            { word: "correr", meaning: "to run" },
            { word: "hablar", meaning: "to speak" },
          ],
          // Time & Days
          [
            { word: "lunes", meaning: "Monday" },
            { word: "martes", meaning: "Tuesday" },
            { word: "hoy", meaning: "today" },
            { word: "mañana", meaning: "tomorrow" },
            { word: "la hora", meaning: "the hour" },
          ],
          // Clothing
          [
            { word: "la camisa", meaning: "the shirt" },
            { word: "los zapatos", meaning: "the shoes" },
            { word: "el sombrero", meaning: "the hat" },
            { word: "la falda", meaning: "the skirt" },
            { word: "el abrigo", meaning: "the coat" },
          ],
          // Body & Health
          [
            { word: "la cabeza", meaning: "the head" },
            { word: "la mano", meaning: "the hand" },
            { word: "el ojo", meaning: "the eye" },
            { word: "el corazón", meaning: "the heart" },
            { word: "la boca", meaning: "the mouth" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[2],
        description: "Food and drinks in Spanish",
        words: [
          // Fruits & Vegetables
          [
            { word: "la manzana", meaning: "the apple" },
            { word: "el plátano", meaning: "the banana" },
            { word: "la naranja", meaning: "the orange" },
            { word: "la zanahoria", meaning: "the carrot" },
            { word: "la patata", meaning: "the potato" },
          ],
          // Meals & Cooking
          [
            { word: "el desayuno", meaning: "breakfast" },
            { word: "el almuerzo", meaning: "lunch" },
            { word: "la cena", meaning: "dinner" },
            { word: "el arroz", meaning: "rice" },
            { word: "el pan", meaning: "bread" },
          ],
          // Drinks
          [
            { word: "el agua", meaning: "water" },
            { word: "la leche", meaning: "milk" },
            { word: "el café", meaning: "coffee" },
            { word: "el jugo", meaning: "juice" },
            { word: "el té", meaning: "tea" },
          ],
          // At the Restaurant
          [
            { word: "el menú", meaning: "the menu" },
            { word: "la cuenta", meaning: "the bill" },
            { word: "el camarero", meaning: "the waiter" },
            { word: "la propina", meaning: "the tip" },
            { word: "el plato", meaning: "the plate" },
          ],
          // Tastes & Descriptions
          [
            { word: "dulce", meaning: "sweet" },
            { word: "salado", meaning: "salty" },
            { word: "picante", meaning: "spicy" },
            { word: "delicioso", meaning: "delicious" },
            { word: "fresco", meaning: "fresh" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[3],
        description: "Travel and directions in Spanish",
        words: [
          // Transportation
          [
            { word: "el avión", meaning: "the airplane" },
            { word: "el tren", meaning: "the train" },
            { word: "el autobús", meaning: "the bus" },
            { word: "el coche", meaning: "the car" },
            { word: "el barco", meaning: "the boat" },
          ],
          // Directions
          [
            { word: "izquierda", meaning: "left" },
            { word: "derecha", meaning: "right" },
            { word: "recto", meaning: "straight" },
            { word: "cerca", meaning: "near" },
            { word: "lejos", meaning: "far" },
          ],
          // Places & Buildings
          [
            { word: "el aeropuerto", meaning: "the airport" },
            { word: "el hospital", meaning: "the hospital" },
            { word: "la escuela", meaning: "the school" },
            { word: "el banco", meaning: "the bank" },
            { word: "la tienda", meaning: "the shop" },
          ],
          // Hotel & Accommodation
          [
            { word: "el hotel", meaning: "the hotel" },
            { word: "la habitación", meaning: "the room" },
            { word: "la reserva", meaning: "the reservation" },
            { word: "la llave", meaning: "the key" },
            { word: "el equipaje", meaning: "the luggage" },
          ],
          // Nature & Weather
          [
            { word: "el sol", meaning: "the sun" },
            { word: "la lluvia", meaning: "the rain" },
            { word: "el viento", meaning: "the wind" },
            { word: "la montaña", meaning: "the mountain" },
            { word: "el mar", meaning: "the sea" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[4],
        description: "Conversation in Spanish",
        words: [
          // Greetings & Farewells
          [
            { word: "hola", meaning: "hello" },
            { word: "adiós", meaning: "goodbye" },
            { word: "buenos días", meaning: "good morning" },
            { word: "buenas noches", meaning: "good night" },
            { word: "hasta luego", meaning: "see you later" },
          ],
          // Introductions
          [
            { word: "me llamo", meaning: "my name is" },
            { word: "mucho gusto", meaning: "nice to meet you" },
            { word: "¿cómo estás?", meaning: "how are you?" },
            { word: "soy de", meaning: "I am from" },
            { word: "tengo … años", meaning: "I am … years old" },
          ],
          // Common Phrases
          [
            { word: "por favor", meaning: "please" },
            { word: "gracias", meaning: "thank you" },
            { word: "de nada", meaning: "you're welcome" },
            { word: "lo siento", meaning: "I'm sorry" },
            { word: "no entiendo", meaning: "I don't understand" },
          ],
          // Feelings & Emotions
          [
            { word: "feliz", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "enojado", meaning: "angry" },
            { word: "cansado", meaning: "tired" },
            { word: "emocionado", meaning: "excited" },
          ],
          // Polite Expressions
          [
            { word: "con permiso", meaning: "excuse me" },
            { word: "disculpe", meaning: "pardon me" },
            { word: "¡salud!", meaning: "bless you! / cheers!" },
            { word: "buen provecho", meaning: "enjoy your meal" },
            { word: "¡buena suerte!", meaning: "good luck!" },
          ],
        ],
      },
    ],
  };
}

function buildItalian(): LanguageConfig {
  return {
    title: "Italian",
    imageSrc: "/it.svg",
    units: [
      {
        ...UNIT_TEMPLATES[0],
        description: "Learn the basics of Italian",
        words: [
          [
            { word: "l'uomo", meaning: "the man" },
            { word: "la donna", meaning: "the woman" },
            { word: "il ragazzo", meaning: "the boy" },
            { word: "la ragazza", meaning: "the girl" },
            { word: "la madre", meaning: "the mother" },
          ],
          [
            { word: "uno", meaning: "one" },
            { word: "due", meaning: "two" },
            { word: "tre", meaning: "three" },
            { word: "quattro", meaning: "four" },
            { word: "cinque", meaning: "five" },
          ],
          [
            { word: "rosso", meaning: "red" },
            { word: "blu", meaning: "blue" },
            { word: "verde", meaning: "green" },
            { word: "giallo", meaning: "yellow" },
            { word: "nero", meaning: "black" },
          ],
          [
            { word: "il libro", meaning: "the book" },
            { word: "il tavolo", meaning: "the table" },
            { word: "la sedia", meaning: "the chair" },
            { word: "il telefono", meaning: "the phone" },
            { word: "la chiave", meaning: "the key" },
          ],
          [
            { word: "grande", meaning: "big" },
            { word: "piccolo", meaning: "small" },
            { word: "buono", meaning: "good" },
            { word: "cattivo", meaning: "bad" },
            { word: "nuovo", meaning: "new" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[1],
        description: "Daily life in Italian",
        words: [
          [
            { word: "la casa", meaning: "the house" },
            { word: "la cucina", meaning: "the kitchen" },
            { word: "il bagno", meaning: "the bathroom" },
            { word: "il letto", meaning: "the bed" },
            { word: "la porta", meaning: "the door" },
          ],
          [
            { word: "mangiare", meaning: "to eat" },
            { word: "bere", meaning: "to drink" },
            { word: "dormire", meaning: "to sleep" },
            { word: "correre", meaning: "to run" },
            { word: "parlare", meaning: "to speak" },
          ],
          [
            { word: "lunedì", meaning: "Monday" },
            { word: "martedì", meaning: "Tuesday" },
            { word: "oggi", meaning: "today" },
            { word: "domani", meaning: "tomorrow" },
            { word: "l'ora", meaning: "the hour" },
          ],
          [
            { word: "la camicia", meaning: "the shirt" },
            { word: "le scarpe", meaning: "the shoes" },
            { word: "il cappello", meaning: "the hat" },
            { word: "la gonna", meaning: "the skirt" },
            { word: "il cappotto", meaning: "the coat" },
          ],
          [
            { word: "la testa", meaning: "the head" },
            { word: "la mano", meaning: "the hand" },
            { word: "l'occhio", meaning: "the eye" },
            { word: "il cuore", meaning: "the heart" },
            { word: "la bocca", meaning: "the mouth" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[2],
        description: "Food and drinks in Italian",
        words: [
          [
            { word: "la mela", meaning: "the apple" },
            { word: "la banana", meaning: "the banana" },
            { word: "l'arancia", meaning: "the orange" },
            { word: "la carota", meaning: "the carrot" },
            { word: "la patata", meaning: "the potato" },
          ],
          [
            { word: "la colazione", meaning: "breakfast" },
            { word: "il pranzo", meaning: "lunch" },
            { word: "la cena", meaning: "dinner" },
            { word: "il riso", meaning: "rice" },
            { word: "il pane", meaning: "bread" },
          ],
          [
            { word: "l'acqua", meaning: "water" },
            { word: "il latte", meaning: "milk" },
            { word: "il caffè", meaning: "coffee" },
            { word: "il succo", meaning: "juice" },
            { word: "il tè", meaning: "tea" },
          ],
          [
            { word: "il menù", meaning: "the menu" },
            { word: "il conto", meaning: "the bill" },
            { word: "il cameriere", meaning: "the waiter" },
            { word: "la mancia", meaning: "the tip" },
            { word: "il piatto", meaning: "the plate" },
          ],
          [
            { word: "dolce", meaning: "sweet" },
            { word: "salato", meaning: "salty" },
            { word: "piccante", meaning: "spicy" },
            { word: "delizioso", meaning: "delicious" },
            { word: "fresco", meaning: "fresh" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[3],
        description: "Travel and directions in Italian",
        words: [
          [
            { word: "l'aereo", meaning: "the airplane" },
            { word: "il treno", meaning: "the train" },
            { word: "l'autobus", meaning: "the bus" },
            { word: "la macchina", meaning: "the car" },
            { word: "la barca", meaning: "the boat" },
          ],
          [
            { word: "sinistra", meaning: "left" },
            { word: "destra", meaning: "right" },
            { word: "dritto", meaning: "straight" },
            { word: "vicino", meaning: "near" },
            { word: "lontano", meaning: "far" },
          ],
          [
            { word: "l'aeroporto", meaning: "the airport" },
            { word: "l'ospedale", meaning: "the hospital" },
            { word: "la scuola", meaning: "the school" },
            { word: "la banca", meaning: "the bank" },
            { word: "il negozio", meaning: "the shop" },
          ],
          [
            { word: "l'albergo", meaning: "the hotel" },
            { word: "la camera", meaning: "the room" },
            { word: "la prenotazione", meaning: "the reservation" },
            { word: "la chiave", meaning: "the key" },
            { word: "il bagaglio", meaning: "the luggage" },
          ],
          [
            { word: "il sole", meaning: "the sun" },
            { word: "la pioggia", meaning: "the rain" },
            { word: "il vento", meaning: "the wind" },
            { word: "la montagna", meaning: "the mountain" },
            { word: "il mare", meaning: "the sea" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[4],
        description: "Conversation in Italian",
        words: [
          [
            { word: "ciao", meaning: "hello" },
            { word: "arrivederci", meaning: "goodbye" },
            { word: "buongiorno", meaning: "good morning" },
            { word: "buonanotte", meaning: "good night" },
            { word: "a dopo", meaning: "see you later" },
          ],
          [
            { word: "mi chiamo", meaning: "my name is" },
            { word: "piacere", meaning: "nice to meet you" },
            { word: "come stai?", meaning: "how are you?" },
            { word: "sono di", meaning: "I am from" },
            { word: "ho … anni", meaning: "I am … years old" },
          ],
          [
            { word: "per favore", meaning: "please" },
            { word: "grazie", meaning: "thank you" },
            { word: "prego", meaning: "you're welcome" },
            { word: "mi dispiace", meaning: "I'm sorry" },
            { word: "non capisco", meaning: "I don't understand" },
          ],
          [
            { word: "felice", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "arrabbiato", meaning: "angry" },
            { word: "stanco", meaning: "tired" },
            { word: "emozionato", meaning: "excited" },
          ],
          [
            { word: "permesso", meaning: "excuse me" },
            { word: "scusi", meaning: "pardon me" },
            { word: "salute!", meaning: "bless you! / cheers!" },
            { word: "buon appetito", meaning: "enjoy your meal" },
            { word: "in bocca al lupo!", meaning: "good luck!" },
          ],
        ],
      },
    ],
  };
}

function buildFrench(): LanguageConfig {
  return {
    title: "French",
    imageSrc: "/fr.svg",
    units: [
      {
        ...UNIT_TEMPLATES[0],
        description: "Learn the basics of French",
        words: [
          [
            { word: "l'homme", meaning: "the man" },
            { word: "la femme", meaning: "the woman" },
            { word: "le garçon", meaning: "the boy" },
            { word: "la fille", meaning: "the girl" },
            { word: "la mère", meaning: "the mother" },
          ],
          [
            { word: "un", meaning: "one" },
            { word: "deux", meaning: "two" },
            { word: "trois", meaning: "three" },
            { word: "quatre", meaning: "four" },
            { word: "cinq", meaning: "five" },
          ],
          [
            { word: "rouge", meaning: "red" },
            { word: "bleu", meaning: "blue" },
            { word: "vert", meaning: "green" },
            { word: "jaune", meaning: "yellow" },
            { word: "noir", meaning: "black" },
          ],
          [
            { word: "le livre", meaning: "the book" },
            { word: "la table", meaning: "the table" },
            { word: "la chaise", meaning: "the chair" },
            { word: "le téléphone", meaning: "the phone" },
            { word: "la clé", meaning: "the key" },
          ],
          [
            { word: "grand", meaning: "big" },
            { word: "petit", meaning: "small" },
            { word: "bon", meaning: "good" },
            { word: "mauvais", meaning: "bad" },
            { word: "nouveau", meaning: "new" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[1],
        description: "Daily life in French",
        words: [
          [
            { word: "la maison", meaning: "the house" },
            { word: "la cuisine", meaning: "the kitchen" },
            { word: "la salle de bain", meaning: "the bathroom" },
            { word: "le lit", meaning: "the bed" },
            { word: "la porte", meaning: "the door" },
          ],
          [
            { word: "manger", meaning: "to eat" },
            { word: "boire", meaning: "to drink" },
            { word: "dormir", meaning: "to sleep" },
            { word: "courir", meaning: "to run" },
            { word: "parler", meaning: "to speak" },
          ],
          [
            { word: "lundi", meaning: "Monday" },
            { word: "mardi", meaning: "Tuesday" },
            { word: "aujourd'hui", meaning: "today" },
            { word: "demain", meaning: "tomorrow" },
            { word: "l'heure", meaning: "the hour" },
          ],
          [
            { word: "la chemise", meaning: "the shirt" },
            { word: "les chaussures", meaning: "the shoes" },
            { word: "le chapeau", meaning: "the hat" },
            { word: "la jupe", meaning: "the skirt" },
            { word: "le manteau", meaning: "the coat" },
          ],
          [
            { word: "la tête", meaning: "the head" },
            { word: "la main", meaning: "the hand" },
            { word: "l'œil", meaning: "the eye" },
            { word: "le cœur", meaning: "the heart" },
            { word: "la bouche", meaning: "the mouth" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[2],
        description: "Food and drinks in French",
        words: [
          [
            { word: "la pomme", meaning: "the apple" },
            { word: "la banane", meaning: "the banana" },
            { word: "l'orange", meaning: "the orange" },
            { word: "la carotte", meaning: "the carrot" },
            { word: "la pomme de terre", meaning: "the potato" },
          ],
          [
            { word: "le petit déjeuner", meaning: "breakfast" },
            { word: "le déjeuner", meaning: "lunch" },
            { word: "le dîner", meaning: "dinner" },
            { word: "le riz", meaning: "rice" },
            { word: "le pain", meaning: "bread" },
          ],
          [
            { word: "l'eau", meaning: "water" },
            { word: "le lait", meaning: "milk" },
            { word: "le café", meaning: "coffee" },
            { word: "le jus", meaning: "juice" },
            { word: "le thé", meaning: "tea" },
          ],
          [
            { word: "le menu", meaning: "the menu" },
            { word: "l'addition", meaning: "the bill" },
            { word: "le serveur", meaning: "the waiter" },
            { word: "le pourboire", meaning: "the tip" },
            { word: "l'assiette", meaning: "the plate" },
          ],
          [
            { word: "sucré", meaning: "sweet" },
            { word: "salé", meaning: "salty" },
            { word: "épicé", meaning: "spicy" },
            { word: "délicieux", meaning: "delicious" },
            { word: "frais", meaning: "fresh" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[3],
        description: "Travel and directions in French",
        words: [
          [
            { word: "l'avion", meaning: "the airplane" },
            { word: "le train", meaning: "the train" },
            { word: "le bus", meaning: "the bus" },
            { word: "la voiture", meaning: "the car" },
            { word: "le bateau", meaning: "the boat" },
          ],
          [
            { word: "à gauche", meaning: "left" },
            { word: "à droite", meaning: "right" },
            { word: "tout droit", meaning: "straight" },
            { word: "près", meaning: "near" },
            { word: "loin", meaning: "far" },
          ],
          [
            { word: "l'aéroport", meaning: "the airport" },
            { word: "l'hôpital", meaning: "the hospital" },
            { word: "l'école", meaning: "the school" },
            { word: "la banque", meaning: "the bank" },
            { word: "le magasin", meaning: "the shop" },
          ],
          [
            { word: "l'hôtel", meaning: "the hotel" },
            { word: "la chambre", meaning: "the room" },
            { word: "la réservation", meaning: "the reservation" },
            { word: "la clé", meaning: "the key" },
            { word: "les bagages", meaning: "the luggage" },
          ],
          [
            { word: "le soleil", meaning: "the sun" },
            { word: "la pluie", meaning: "the rain" },
            { word: "le vent", meaning: "the wind" },
            { word: "la montagne", meaning: "the mountain" },
            { word: "la mer", meaning: "the sea" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[4],
        description: "Conversation in French",
        words: [
          [
            { word: "bonjour", meaning: "hello" },
            { word: "au revoir", meaning: "goodbye" },
            { word: "bon matin", meaning: "good morning" },
            { word: "bonne nuit", meaning: "good night" },
            { word: "à plus tard", meaning: "see you later" },
          ],
          [
            { word: "je m'appelle", meaning: "my name is" },
            { word: "enchanté", meaning: "nice to meet you" },
            { word: "comment allez-vous?", meaning: "how are you?" },
            { word: "je viens de", meaning: "I am from" },
            { word: "j'ai … ans", meaning: "I am … years old" },
          ],
          [
            { word: "s'il vous plaît", meaning: "please" },
            { word: "merci", meaning: "thank you" },
            { word: "de rien", meaning: "you're welcome" },
            { word: "je suis désolé", meaning: "I'm sorry" },
            { word: "je ne comprends pas", meaning: "I don't understand" },
          ],
          [
            { word: "heureux", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "en colère", meaning: "angry" },
            { word: "fatigué", meaning: "tired" },
            { word: "excité", meaning: "excited" },
          ],
          [
            { word: "excusez-moi", meaning: "excuse me" },
            { word: "pardon", meaning: "pardon me" },
            { word: "à vos souhaits!", meaning: "bless you! / cheers!" },
            { word: "bon appétit", meaning: "enjoy your meal" },
            { word: "bonne chance!", meaning: "good luck!" },
          ],
        ],
      },
    ],
  };
}

function buildJapanese(): LanguageConfig {
  return {
    title: "Japanese",
    imageSrc: "/jp.svg",
    units: [
      {
        ...UNIT_TEMPLATES[0],
        description: "Learn the basics of Japanese",
        words: [
          [
            { word: "男の人 (おとこのひと)", meaning: "the man" },
            { word: "女の人 (おんなのひと)", meaning: "the woman" },
            { word: "男の子 (おとこのこ)", meaning: "the boy" },
            { word: "女の子 (おんなのこ)", meaning: "the girl" },
            { word: "お母さん (おかあさん)", meaning: "the mother" },
          ],
          [
            { word: "一 (いち)", meaning: "one" },
            { word: "二 (に)", meaning: "two" },
            { word: "三 (さん)", meaning: "three" },
            { word: "四 (よん)", meaning: "four" },
            { word: "五 (ご)", meaning: "five" },
          ],
          [
            { word: "赤 (あか)", meaning: "red" },
            { word: "青 (あお)", meaning: "blue" },
            { word: "緑 (みどり)", meaning: "green" },
            { word: "黄色 (きいろ)", meaning: "yellow" },
            { word: "黒 (くろ)", meaning: "black" },
          ],
          [
            { word: "本 (ほん)", meaning: "the book" },
            { word: "テーブル", meaning: "the table" },
            { word: "椅子 (いす)", meaning: "the chair" },
            { word: "電話 (でんわ)", meaning: "the phone" },
            { word: "鍵 (かぎ)", meaning: "the key" },
          ],
          [
            { word: "大きい (おおきい)", meaning: "big" },
            { word: "小さい (ちいさい)", meaning: "small" },
            { word: "良い (よい)", meaning: "good" },
            { word: "悪い (わるい)", meaning: "bad" },
            { word: "新しい (あたらしい)", meaning: "new" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[1],
        description: "Daily life in Japanese",
        words: [
          [
            { word: "家 (いえ)", meaning: "the house" },
            { word: "台所 (だいどころ)", meaning: "the kitchen" },
            { word: "お風呂 (おふろ)", meaning: "the bathroom" },
            { word: "ベッド", meaning: "the bed" },
            { word: "ドア", meaning: "the door" },
          ],
          [
            { word: "食べる (たべる)", meaning: "to eat" },
            { word: "飲む (のむ)", meaning: "to drink" },
            { word: "寝る (ねる)", meaning: "to sleep" },
            { word: "走る (はしる)", meaning: "to run" },
            { word: "話す (はなす)", meaning: "to speak" },
          ],
          [
            { word: "月曜日 (げつようび)", meaning: "Monday" },
            { word: "火曜日 (かようび)", meaning: "Tuesday" },
            { word: "今日 (きょう)", meaning: "today" },
            { word: "明日 (あした)", meaning: "tomorrow" },
            { word: "時間 (じかん)", meaning: "the hour" },
          ],
          [
            { word: "シャツ", meaning: "the shirt" },
            { word: "靴 (くつ)", meaning: "the shoes" },
            { word: "帽子 (ぼうし)", meaning: "the hat" },
            { word: "スカート", meaning: "the skirt" },
            { word: "コート", meaning: "the coat" },
          ],
          [
            { word: "頭 (あたま)", meaning: "the head" },
            { word: "手 (て)", meaning: "the hand" },
            { word: "目 (め)", meaning: "the eye" },
            { word: "心 (こころ)", meaning: "the heart" },
            { word: "口 (くち)", meaning: "the mouth" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[2],
        description: "Food and drinks in Japanese",
        words: [
          [
            { word: "りんご", meaning: "the apple" },
            { word: "バナナ", meaning: "the banana" },
            { word: "オレンジ", meaning: "the orange" },
            { word: "にんじん", meaning: "the carrot" },
            { word: "じゃがいも", meaning: "the potato" },
          ],
          [
            { word: "朝ごはん (あさごはん)", meaning: "breakfast" },
            { word: "昼ごはん (ひるごはん)", meaning: "lunch" },
            { word: "晩ごはん (ばんごはん)", meaning: "dinner" },
            { word: "ご飯 (ごはん)", meaning: "rice" },
            { word: "パン", meaning: "bread" },
          ],
          [
            { word: "水 (みず)", meaning: "water" },
            { word: "牛乳 (ぎゅうにゅう)", meaning: "milk" },
            { word: "コーヒー", meaning: "coffee" },
            { word: "ジュース", meaning: "juice" },
            { word: "お茶 (おちゃ)", meaning: "tea" },
          ],
          [
            { word: "メニュー", meaning: "the menu" },
            { word: "お会計 (おかいけい)", meaning: "the bill" },
            { word: "ウェイター", meaning: "the waiter" },
            { word: "チップ", meaning: "the tip" },
            { word: "お皿 (おさら)", meaning: "the plate" },
          ],
          [
            { word: "甘い (あまい)", meaning: "sweet" },
            { word: "塩辛い (しおからい)", meaning: "salty" },
            { word: "辛い (からい)", meaning: "spicy" },
            { word: "美味しい (おいしい)", meaning: "delicious" },
            { word: "新鮮 (しんせん)", meaning: "fresh" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[3],
        description: "Travel and directions in Japanese",
        words: [
          [
            { word: "飛行機 (ひこうき)", meaning: "the airplane" },
            { word: "電車 (でんしゃ)", meaning: "the train" },
            { word: "バス", meaning: "the bus" },
            { word: "車 (くるま)", meaning: "the car" },
            { word: "船 (ふね)", meaning: "the boat" },
          ],
          [
            { word: "左 (ひだり)", meaning: "left" },
            { word: "右 (みぎ)", meaning: "right" },
            { word: "まっすぐ", meaning: "straight" },
            { word: "近い (ちかい)", meaning: "near" },
            { word: "遠い (とおい)", meaning: "far" },
          ],
          [
            { word: "空港 (くうこう)", meaning: "the airport" },
            { word: "病院 (びょういん)", meaning: "the hospital" },
            { word: "学校 (がっこう)", meaning: "the school" },
            { word: "銀行 (ぎんこう)", meaning: "the bank" },
            { word: "店 (みせ)", meaning: "the shop" },
          ],
          [
            { word: "ホテル", meaning: "the hotel" },
            { word: "部屋 (へや)", meaning: "the room" },
            { word: "予約 (よやく)", meaning: "the reservation" },
            { word: "鍵 (かぎ)", meaning: "the key" },
            { word: "荷物 (にもつ)", meaning: "the luggage" },
          ],
          [
            { word: "太陽 (たいよう)", meaning: "the sun" },
            { word: "雨 (あめ)", meaning: "the rain" },
            { word: "風 (かぜ)", meaning: "the wind" },
            { word: "山 (やま)", meaning: "the mountain" },
            { word: "海 (うみ)", meaning: "the sea" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[4],
        description: "Conversation in Japanese",
        words: [
          [
            { word: "こんにちは", meaning: "hello" },
            { word: "さようなら", meaning: "goodbye" },
            { word: "おはようございます", meaning: "good morning" },
            { word: "おやすみなさい", meaning: "good night" },
            { word: "また後で (またあとで)", meaning: "see you later" },
          ],
          [
            { word: "私の名前は (わたしのなまえは)", meaning: "my name is" },
            { word: "はじめまして", meaning: "nice to meet you" },
            { word: "お元気ですか (おげんきですか)", meaning: "how are you?" },
            { word: "出身は (しゅっしんは)", meaning: "I am from" },
            { word: "…歳です (…さいです)", meaning: "I am … years old" },
          ],
          [
            { word: "お願いします (おねがいします)", meaning: "please" },
            { word: "ありがとう", meaning: "thank you" },
            { word: "どういたしまして", meaning: "you're welcome" },
            { word: "すみません", meaning: "I'm sorry" },
            { word: "分かりません (わかりません)", meaning: "I don't understand" },
          ],
          [
            { word: "嬉しい (うれしい)", meaning: "happy" },
            { word: "悲しい (かなしい)", meaning: "sad" },
            { word: "怒っている (おこっている)", meaning: "angry" },
            { word: "疲れた (つかれた)", meaning: "tired" },
            { word: "わくわくする", meaning: "excited" },
          ],
          [
            { word: "失礼します (しつれいします)", meaning: "excuse me" },
            { word: "ごめんなさい", meaning: "pardon me" },
            { word: "乾杯 (かんぱい)", meaning: "bless you! / cheers!" },
            { word: "いただきます", meaning: "enjoy your meal" },
            { word: "頑張って (がんばって)", meaning: "good luck!" },
          ],
        ],
      },
    ],
  };
}

function buildEnglish(): LanguageConfig {
  return {
    title: "English",
    imageSrc: "/en.svg",
    units: [
      {
        ...UNIT_TEMPLATES[0],
        description: "Learn the basics of English",
        words: [
          [
            { word: "man", meaning: "男人" },
            { word: "woman", meaning: "女人" },
            { word: "boy", meaning: "男孩" },
            { word: "girl", meaning: "女孩" },
            { word: "mother", meaning: "母亲" },
          ],
          [
            { word: "one", meaning: "一" },
            { word: "two", meaning: "二" },
            { word: "three", meaning: "三" },
            { word: "four", meaning: "四" },
            { word: "five", meaning: "五" },
          ],
          [
            { word: "red", meaning: "红色" },
            { word: "blue", meaning: "蓝色" },
            { word: "green", meaning: "绿色" },
            { word: "yellow", meaning: "黄色" },
            { word: "black", meaning: "黑色" },
          ],
          [
            { word: "book", meaning: "书" },
            { word: "table", meaning: "桌子" },
            { word: "chair", meaning: "椅子" },
            { word: "phone", meaning: "电话" },
            { word: "key", meaning: "钥匙" },
          ],
          [
            { word: "big", meaning: "大" },
            { word: "small", meaning: "小" },
            { word: "good", meaning: "好" },
            { word: "bad", meaning: "坏" },
            { word: "new", meaning: "新" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[1],
        description: "Daily life in English",
        words: [
          [
            { word: "house", meaning: "房子" },
            { word: "kitchen", meaning: "厨房" },
            { word: "bathroom", meaning: "浴室" },
            { word: "bed", meaning: "床" },
            { word: "door", meaning: "门" },
          ],
          [
            { word: "eat", meaning: "吃" },
            { word: "drink", meaning: "喝" },
            { word: "sleep", meaning: "睡觉" },
            { word: "run", meaning: "跑" },
            { word: "speak", meaning: "说" },
          ],
          [
            { word: "Monday", meaning: "星期一" },
            { word: "Tuesday", meaning: "星期二" },
            { word: "today", meaning: "今天" },
            { word: "tomorrow", meaning: "明天" },
            { word: "hour", meaning: "小时" },
          ],
          [
            { word: "shirt", meaning: "衬衫" },
            { word: "shoes", meaning: "鞋子" },
            { word: "hat", meaning: "帽子" },
            { word: "skirt", meaning: "裙子" },
            { word: "coat", meaning: "外套" },
          ],
          [
            { word: "head", meaning: "头" },
            { word: "hand", meaning: "手" },
            { word: "eye", meaning: "眼睛" },
            { word: "heart", meaning: "心脏" },
            { word: "mouth", meaning: "嘴" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[2],
        description: "Food and drinks in English",
        words: [
          [
            { word: "apple", meaning: "苹果" },
            { word: "banana", meaning: "香蕉" },
            { word: "orange", meaning: "橙子" },
            { word: "carrot", meaning: "胡萝卜" },
            { word: "potato", meaning: "土豆" },
          ],
          [
            { word: "breakfast", meaning: "早餐" },
            { word: "lunch", meaning: "午餐" },
            { word: "dinner", meaning: "晚餐" },
            { word: "rice", meaning: "米饭" },
            { word: "bread", meaning: "面包" },
          ],
          [
            { word: "water", meaning: "水" },
            { word: "milk", meaning: "牛奶" },
            { word: "coffee", meaning: "咖啡" },
            { word: "juice", meaning: "果汁" },
            { word: "tea", meaning: "茶" },
          ],
          [
            { word: "menu", meaning: "菜单" },
            { word: "bill", meaning: "账单" },
            { word: "waiter", meaning: "服务员" },
            { word: "tip", meaning: "小费" },
            { word: "plate", meaning: "盘子" },
          ],
          [
            { word: "sweet", meaning: "甜的" },
            { word: "salty", meaning: "咸的" },
            { word: "spicy", meaning: "辣的" },
            { word: "delicious", meaning: "美味的" },
            { word: "fresh", meaning: "新鲜的" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[3],
        description: "Travel and directions in English",
        words: [
          [
            { word: "airplane", meaning: "飞机" },
            { word: "train", meaning: "火车" },
            { word: "bus", meaning: "公共汽车" },
            { word: "car", meaning: "汽车" },
            { word: "boat", meaning: "船" },
          ],
          [
            { word: "left", meaning: "左" },
            { word: "right", meaning: "右" },
            { word: "straight", meaning: "直行" },
            { word: "near", meaning: "近" },
            { word: "far", meaning: "远" },
          ],
          [
            { word: "airport", meaning: "机场" },
            { word: "hospital", meaning: "医院" },
            { word: "school", meaning: "学校" },
            { word: "bank", meaning: "银行" },
            { word: "shop", meaning: "商店" },
          ],
          [
            { word: "hotel", meaning: "酒店" },
            { word: "room", meaning: "房间" },
            { word: "reservation", meaning: "预订" },
            { word: "key", meaning: "钥匙" },
            { word: "luggage", meaning: "行李" },
          ],
          [
            { word: "sun", meaning: "太阳" },
            { word: "rain", meaning: "雨" },
            { word: "wind", meaning: "风" },
            { word: "mountain", meaning: "山" },
            { word: "sea", meaning: "海" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[4],
        description: "Conversation in English",
        words: [
          [
            { word: "hello", meaning: "你好" },
            { word: "goodbye", meaning: "再见" },
            { word: "good morning", meaning: "早上好" },
            { word: "good night", meaning: "晚安" },
            { word: "see you later", meaning: "回头见" },
          ],
          [
            { word: "my name is", meaning: "我叫" },
            { word: "nice to meet you", meaning: "很高兴认识你" },
            { word: "how are you?", meaning: "你好吗？" },
            { word: "I am from", meaning: "我来自" },
            { word: "I am … years old", meaning: "我…岁了" },
          ],
          [
            { word: "please", meaning: "请" },
            { word: "thank you", meaning: "谢谢" },
            { word: "you're welcome", meaning: "不客气" },
            { word: "I'm sorry", meaning: "对不起" },
            { word: "I don't understand", meaning: "我不明白" },
          ],
          [
            { word: "happy", meaning: "高兴" },
            { word: "sad", meaning: "伤心" },
            { word: "angry", meaning: "生气" },
            { word: "tired", meaning: "累" },
            { word: "excited", meaning: "兴奋" },
          ],
          [
            { word: "excuse me", meaning: "打扰一下" },
            { word: "pardon me", meaning: "对不起" },
            { word: "cheers!", meaning: "干杯！" },
            { word: "enjoy your meal", meaning: "请慢用" },
            { word: "good luck!", meaning: "祝你好运！" },
          ],
        ],
      },
    ],
  };
}

function buildChinese(): LanguageConfig {
  return {
    title: "Chinese",
    imageSrc: "/cn.svg",
    units: [
      {
        ...UNIT_TEMPLATES[0],
        description: "Learn the basics of Chinese",
        words: [
          [
            { word: "男人 (nánrén)", meaning: "the man" },
            { word: "女人 (nǚrén)", meaning: "the woman" },
            { word: "男孩 (nánhái)", meaning: "the boy" },
            { word: "女孩 (nǚhái)", meaning: "the girl" },
            { word: "妈妈 (māma)", meaning: "the mother" },
          ],
          [
            { word: "一 (yī)", meaning: "one" },
            { word: "二 (èr)", meaning: "two" },
            { word: "三 (sān)", meaning: "three" },
            { word: "四 (sì)", meaning: "four" },
            { word: "五 (wǔ)", meaning: "five" },
          ],
          [
            { word: "红色 (hóngsè)", meaning: "red" },
            { word: "蓝色 (lánsè)", meaning: "blue" },
            { word: "绿色 (lǜsè)", meaning: "green" },
            { word: "黄色 (huángsè)", meaning: "yellow" },
            { word: "黑色 (hēisè)", meaning: "black" },
          ],
          [
            { word: "书 (shū)", meaning: "the book" },
            { word: "桌子 (zhuōzi)", meaning: "the table" },
            { word: "椅子 (yǐzi)", meaning: "the chair" },
            { word: "电话 (diànhuà)", meaning: "the phone" },
            { word: "钥匙 (yàoshi)", meaning: "the key" },
          ],
          [
            { word: "大 (dà)", meaning: "big" },
            { word: "小 (xiǎo)", meaning: "small" },
            { word: "好 (hǎo)", meaning: "good" },
            { word: "坏 (huài)", meaning: "bad" },
            { word: "新 (xīn)", meaning: "new" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[1],
        description: "Daily life in Chinese",
        words: [
          [
            { word: "房子 (fángzi)", meaning: "the house" },
            { word: "厨房 (chúfáng)", meaning: "the kitchen" },
            { word: "浴室 (yùshì)", meaning: "the bathroom" },
            { word: "床 (chuáng)", meaning: "the bed" },
            { word: "门 (mén)", meaning: "the door" },
          ],
          [
            { word: "吃 (chī)", meaning: "to eat" },
            { word: "喝 (hē)", meaning: "to drink" },
            { word: "睡觉 (shuìjiào)", meaning: "to sleep" },
            { word: "跑 (pǎo)", meaning: "to run" },
            { word: "说 (shuō)", meaning: "to speak" },
          ],
          [
            { word: "星期一 (xīngqīyī)", meaning: "Monday" },
            { word: "星期二 (xīngqīèr)", meaning: "Tuesday" },
            { word: "今天 (jīntiān)", meaning: "today" },
            { word: "明天 (míngtiān)", meaning: "tomorrow" },
            { word: "小时 (xiǎoshí)", meaning: "the hour" },
          ],
          [
            { word: "衬衫 (chènshān)", meaning: "the shirt" },
            { word: "鞋子 (xiézi)", meaning: "the shoes" },
            { word: "帽子 (màozi)", meaning: "the hat" },
            { word: "裙子 (qúnzi)", meaning: "the skirt" },
            { word: "外套 (wàitào)", meaning: "the coat" },
          ],
          [
            { word: "头 (tóu)", meaning: "the head" },
            { word: "手 (shǒu)", meaning: "the hand" },
            { word: "眼睛 (yǎnjing)", meaning: "the eye" },
            { word: "心脏 (xīnzàng)", meaning: "the heart" },
            { word: "嘴 (zuǐ)", meaning: "the mouth" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[2],
        description: "Food and drinks in Chinese",
        words: [
          [
            { word: "苹果 (píngguǒ)", meaning: "the apple" },
            { word: "香蕉 (xiāngjiāo)", meaning: "the banana" },
            { word: "橙子 (chéngzi)", meaning: "the orange" },
            { word: "胡萝卜 (húluóbo)", meaning: "the carrot" },
            { word: "土豆 (tǔdòu)", meaning: "the potato" },
          ],
          [
            { word: "早餐 (zǎocān)", meaning: "breakfast" },
            { word: "午餐 (wǔcān)", meaning: "lunch" },
            { word: "晚餐 (wǎncān)", meaning: "dinner" },
            { word: "米饭 (mǐfàn)", meaning: "rice" },
            { word: "面包 (miànbāo)", meaning: "bread" },
          ],
          [
            { word: "水 (shuǐ)", meaning: "water" },
            { word: "牛奶 (niúnǎi)", meaning: "milk" },
            { word: "咖啡 (kāfēi)", meaning: "coffee" },
            { word: "果汁 (guǒzhī)", meaning: "juice" },
            { word: "茶 (chá)", meaning: "tea" },
          ],
          [
            { word: "菜单 (càidān)", meaning: "the menu" },
            { word: "账单 (zhàngdān)", meaning: "the bill" },
            { word: "服务员 (fúwùyuán)", meaning: "the waiter" },
            { word: "小费 (xiǎofèi)", meaning: "the tip" },
            { word: "盘子 (pánzi)", meaning: "the plate" },
          ],
          [
            { word: "甜 (tián)", meaning: "sweet" },
            { word: "咸 (xián)", meaning: "salty" },
            { word: "辣 (là)", meaning: "spicy" },
            { word: "美味 (měiwèi)", meaning: "delicious" },
            { word: "新鲜 (xīnxiān)", meaning: "fresh" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[3],
        description: "Travel and directions in Chinese",
        words: [
          [
            { word: "飞机 (fēijī)", meaning: "the airplane" },
            { word: "火车 (huǒchē)", meaning: "the train" },
            { word: "公共汽车 (gōnggòng qìchē)", meaning: "the bus" },
            { word: "汽车 (qìchē)", meaning: "the car" },
            { word: "船 (chuán)", meaning: "the boat" },
          ],
          [
            { word: "左 (zuǒ)", meaning: "left" },
            { word: "右 (yòu)", meaning: "right" },
            { word: "直走 (zhí zǒu)", meaning: "straight" },
            { word: "近 (jìn)", meaning: "near" },
            { word: "远 (yuǎn)", meaning: "far" },
          ],
          [
            { word: "机场 (jīchǎng)", meaning: "the airport" },
            { word: "医院 (yīyuàn)", meaning: "the hospital" },
            { word: "学校 (xuéxiào)", meaning: "the school" },
            { word: "银行 (yínháng)", meaning: "the bank" },
            { word: "商店 (shāngdiàn)", meaning: "the shop" },
          ],
          [
            { word: "酒店 (jiǔdiàn)", meaning: "the hotel" },
            { word: "房间 (fángjiān)", meaning: "the room" },
            { word: "预订 (yùdìng)", meaning: "the reservation" },
            { word: "钥匙 (yàoshi)", meaning: "the key" },
            { word: "行李 (xíngli)", meaning: "the luggage" },
          ],
          [
            { word: "太阳 (tàiyáng)", meaning: "the sun" },
            { word: "雨 (yǔ)", meaning: "the rain" },
            { word: "风 (fēng)", meaning: "the wind" },
            { word: "山 (shān)", meaning: "the mountain" },
            { word: "海 (hǎi)", meaning: "the sea" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[4],
        description: "Conversation in Chinese",
        words: [
          [
            { word: "你好 (nǐ hǎo)", meaning: "hello" },
            { word: "再见 (zàijiàn)", meaning: "goodbye" },
            { word: "早上好 (zǎoshang hǎo)", meaning: "good morning" },
            { word: "晚安 (wǎn'ān)", meaning: "good night" },
            { word: "回头见 (huítóu jiàn)", meaning: "see you later" },
          ],
          [
            { word: "我叫 (wǒ jiào)", meaning: "my name is" },
            { word: "很高兴认识你 (hěn gāoxìng rènshi nǐ)", meaning: "nice to meet you" },
            { word: "你好吗？(nǐ hǎo ma?)", meaning: "how are you?" },
            { word: "我来自 (wǒ lái zì)", meaning: "I am from" },
            { word: "我…岁 (wǒ … suì)", meaning: "I am … years old" },
          ],
          [
            { word: "请 (qǐng)", meaning: "please" },
            { word: "谢谢 (xièxie)", meaning: "thank you" },
            { word: "不客气 (bú kèqi)", meaning: "you're welcome" },
            { word: "对不起 (duìbuqǐ)", meaning: "I'm sorry" },
            { word: "我不明白 (wǒ bù míngbai)", meaning: "I don't understand" },
          ],
          [
            { word: "高兴 (gāoxìng)", meaning: "happy" },
            { word: "伤心 (shāngxīn)", meaning: "sad" },
            { word: "生气 (shēngqì)", meaning: "angry" },
            { word: "累 (lèi)", meaning: "tired" },
            { word: "兴奋 (xīngfèn)", meaning: "excited" },
          ],
          [
            { word: "打扰一下 (dǎrǎo yīxià)", meaning: "excuse me" },
            { word: "不好意思 (bù hǎoyìsi)", meaning: "pardon me" },
            { word: "干杯 (gānbēi)", meaning: "bless you! / cheers!" },
            { word: "请慢用 (qǐng màn yòng)", meaning: "enjoy your meal" },
            { word: "祝你好运 (zhù nǐ hǎo yùn)", meaning: "good luck!" },
          ],
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// All languages
// ---------------------------------------------------------------------------

const LANGUAGES: LanguageConfig[] = [
  buildSpanish(),
  buildItalian(),
  buildFrench(),
  buildJapanese(),
  buildEnglish(),
  buildChinese(),
];

// ---------------------------------------------------------------------------
// Challenge generation helpers
// ---------------------------------------------------------------------------

/**
 * Collect all words in a given unit (across all its lessons).
 * Used to pick distractors from the same unit.
 */
function getAllUnitWords(unit: UnitTheme): WordEntry[] {
  return unit.words.flat();
}

/**
 * Pick `count` distractor words from the unit that are NOT the correct word.
 * Returns words (in the target language) to use as wrong options.
 */
function pickDistractors(
  allUnitWords: WordEntry[],
  correctWord: WordEntry,
  count: number,
): WordEntry[] {
  const candidates = allUnitWords.filter((w) => w.word !== correctWord.word);
  // Shuffle using Fisher-Yates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, count);
}

/**
 * Build challenges and options for a single lesson.
 * Alternates between SELECT and ASSIST question types.
 * Each word produces 2 challenges (one SELECT, one ASSIST) for 10 challenges per lesson.
 */
function buildLessonChallenges(
  lessonWords: WordEntry[],
  allUnitWords: WordEntry[],
): {
  challenges: { type: ChallengeType; question: string; order: number }[];
  options: { challengeIndex: number; text: string; correct: boolean }[];
} {
  const challenges: { type: ChallengeType; question: string; order: number }[] = [];
  const options: { challengeIndex: number; text: string; correct: boolean }[] = [];

  let order = 1;

  for (const wordEntry of lessonWords) {
    // --- SELECT challenge: "Which one of these is 'meaning'?" ---
    const selectIdx = challenges.length;
    challenges.push({
      type: "SELECT",
      question: `Which one of these is "${wordEntry.meaning}"?`,
      order: order++,
    });

    const selectDistractors = pickDistractors(allUnitWords, wordEntry, 2);
    // Correct option
    options.push({
      challengeIndex: selectIdx,
      text: wordEntry.word,
      correct: true,
    });
    // Wrong options
    for (const d of selectDistractors) {
      options.push({
        challengeIndex: selectIdx,
        text: d.word,
        correct: false,
      });
    }

    // --- ASSIST challenge: "word" (translate from target to source) ---
    const assistIdx = challenges.length;
    challenges.push({
      type: "ASSIST",
      question: `"${wordEntry.word}"`,
      order: order++,
    });

    const assistDistractors = pickDistractors(allUnitWords, wordEntry, 2);
    // Correct option (the meaning in the learner's language)
    options.push({
      challengeIndex: assistIdx,
      text: wordEntry.meaning,
      correct: true,
    });
    // Wrong options (other meanings)
    for (const d of assistDistractors) {
      options.push({
        challengeIndex: assistIdx,
        text: d.meaning,
        correct: false,
      });
    }
  }

  return { challenges, options };
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

const main = async () => {
  try {
    console.log("Seeding database");

    // Clean all tables
    await db.delete(schema.courses);
    await db.delete(schema.userProgress);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userSubscription);

    // Auto-increment IDs
    let courseId = 1;
    let unitId = 1;
    let lessonId = 1;
    let challengeId = 1;

    for (const lang of LANGUAGES) {
      // --- Insert course ---
      await db.insert(schema.courses).values({
        id: courseId,
        title: lang.title,
        imageSrc: lang.imageSrc,
      });

      console.log(`  Course: ${lang.title} (id=${courseId})`);

      let unitOrder = 1;
      for (const unit of lang.units) {
        // --- Insert unit ---
        await db.insert(schema.units).values({
          id: unitId,
          courseId,
          title: unit.title,
          description: unit.description,
          order: unitOrder,
        });

        console.log(`    Unit ${unitOrder}: ${unit.description} (id=${unitId})`);

        const allUnitWords = getAllUnitWords(unit);

        let lessonOrder = 1;
        for (let li = 0; li < unit.lessonTitles.length; li++) {
          // --- Insert lesson ---
          await db.insert(schema.lessons).values({
            id: lessonId,
            unitId,
            order: lessonOrder,
            title: unit.lessonTitles[li],
          });

          // Build challenges for this lesson using the corresponding word group
          const lessonWords = unit.words[li] || [];
          const { challenges, options } = buildLessonChallenges(
            lessonWords,
            allUnitWords,
          );

          // --- Insert challenges ---
          for (const ch of challenges) {
            await db.insert(schema.challenges).values({
              id: challengeId,
              lessonId,
              type: ch.type,
              question: ch.question,
              order: ch.order,
            });

            // Insert options for this challenge
            const chOptions = options.filter(
              (o) => o.challengeIndex === challenges.indexOf(ch),
            );
            if (chOptions.length > 0) {
              await db.insert(schema.challengeOptions).values(
                chOptions.map((o) => ({
                  challengeId,
                  text: o.text,
                  correct: o.correct,
                })),
              );
            }

            challengeId++;
          }

          lessonId++;
          lessonOrder++;
        }

        unitId++;
        unitOrder++;
      }

      courseId++;
    }

    console.log("Seeding finished");
    console.log(`  Total courses: ${courseId - 1}`);
    console.log(`  Total units: ${unitId - 1}`);
    console.log(`  Total lessons: ${lessonId - 1}`);
    console.log(`  Total challenges: ${challengeId - 1}`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed the database");
  }
};

main();
