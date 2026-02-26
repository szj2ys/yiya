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

type ChallengeType = "SELECT" | "ASSIST" | "TYPE";

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
  {
    title: "Unit 6",
    description: "Work & Study",
    lessonTitles: ["Professions", "Office & School", "Technology", "Meetings & Classes", "Goals & Plans"],
  },
  {
    title: "Unit 7",
    description: "Shopping & Money",
    lessonTitles: ["At the Store", "Prices & Bargaining", "Clothing Shopping", "Online Shopping", "Banking & Finance"],
  },
  {
    title: "Unit 8",
    description: "Entertainment",
    lessonTitles: ["Music & Dance", "Sports & Fitness", "Movies & TV", "Games & Hobbies", "Celebrations & Events"],
  },
  {
    title: "Unit 9",
    description: "Social Life",
    lessonTitles: ["Making Friends", "Invitations & Plans", "Feelings & Moods", "Communication", "Relationships"],
  },
  {
    title: "Unit 10",
    description: "Advanced Phrases",
    lessonTitles: ["Opinions & Beliefs", "Comparisons", "Requests & Offers", "Cause & Effect", "Common Idioms"],
  },
];

// ---------------------------------------------------------------------------
// Language data — each language has 10 units, each unit has 5 lessons,
// each lesson has 7-8 words → 350-400 words per language
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
            { word: "el padre", meaning: "the father" },
            { word: "el hermano", meaning: "the brother" },
            { word: "la hermana", meaning: "the sister" },
          ],
          // Numbers
          [
            { word: "uno", meaning: "one" },
            { word: "dos", meaning: "two" },
            { word: "tres", meaning: "three" },
            { word: "cuatro", meaning: "four" },
            { word: "cinco", meaning: "five" },
            { word: "seis", meaning: "six" },
            { word: "siete", meaning: "seven" },
          ],
          // Colors
          [
            { word: "rojo", meaning: "red" },
            { word: "azul", meaning: "blue" },
            { word: "verde", meaning: "green" },
            { word: "amarillo", meaning: "yellow" },
            { word: "negro", meaning: "black" },
            { word: "blanco", meaning: "white" },
            { word: "morado", meaning: "purple" },
          ],
          // Common Objects
          [
            { word: "el libro", meaning: "the book" },
            { word: "la mesa", meaning: "the table" },
            { word: "la silla", meaning: "the chair" },
            { word: "el teléfono", meaning: "the phone" },
            { word: "la llave", meaning: "the key" },
            { word: "el reloj", meaning: "the clock" },
            { word: "la ventana", meaning: "the window" },
          ],
          // Basic Adjectives
          [
            { word: "grande", meaning: "big" },
            { word: "pequeño", meaning: "small" },
            { word: "bueno", meaning: "good" },
            { word: "malo", meaning: "bad" },
            { word: "nuevo", meaning: "new" },
            { word: "viejo", meaning: "old" },
            { word: "bonito", meaning: "pretty" },
            { word: "feo", meaning: "ugly" },
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
            { word: "la ventana", meaning: "the window" },
            { word: "el jardín", meaning: "the garden" },
          ],
          // Actions & Verbs
          [
            { word: "comer", meaning: "to eat" },
            { word: "beber", meaning: "to drink" },
            { word: "dormir", meaning: "to sleep" },
            { word: "correr", meaning: "to run" },
            { word: "hablar", meaning: "to speak" },
            { word: "leer", meaning: "to read" },
            { word: "escribir", meaning: "to write" },
            { word: "caminar", meaning: "to walk" },
          ],
          // Time & Days
          [
            { word: "lunes", meaning: "Monday" },
            { word: "martes", meaning: "Tuesday" },
            { word: "hoy", meaning: "today" },
            { word: "mañana", meaning: "tomorrow" },
            { word: "la hora", meaning: "the hour" },
            { word: "miércoles", meaning: "Wednesday" },
            { word: "ayer", meaning: "yesterday" },
          ],
          // Clothing
          [
            { word: "la camisa", meaning: "the shirt" },
            { word: "los zapatos", meaning: "the shoes" },
            { word: "el sombrero", meaning: "the hat" },
            { word: "la falda", meaning: "the skirt" },
            { word: "el abrigo", meaning: "the coat" },
            { word: "los pantalones", meaning: "the pants" },
            { word: "el vestido", meaning: "the dress" },
          ],
          // Body & Health
          [
            { word: "la cabeza", meaning: "the head" },
            { word: "la mano", meaning: "the hand" },
            { word: "el ojo", meaning: "the eye" },
            { word: "el corazón", meaning: "the heart" },
            { word: "la boca", meaning: "the mouth" },
            { word: "la nariz", meaning: "the nose" },
            { word: "el brazo", meaning: "the arm" },
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
            { word: "la fresa", meaning: "the strawberry" },
            { word: "la cebolla", meaning: "the onion" },
          ],
          // Meals & Cooking
          [
            { word: "el desayuno", meaning: "breakfast" },
            { word: "el almuerzo", meaning: "lunch" },
            { word: "la cena", meaning: "dinner" },
            { word: "el arroz", meaning: "rice" },
            { word: "el pan", meaning: "bread" },
            { word: "la sopa", meaning: "the soup" },
            { word: "el huevo", meaning: "the egg" },
            { word: "la sal", meaning: "the salt" },
          ],
          // Drinks
          [
            { word: "el agua", meaning: "water" },
            { word: "la leche", meaning: "milk" },
            { word: "el café", meaning: "coffee" },
            { word: "el jugo", meaning: "juice" },
            { word: "el té", meaning: "tea" },
            { word: "la cerveza", meaning: "the beer" },
            { word: "el vino", meaning: "the wine" },
          ],
          // At the Restaurant
          [
            { word: "el menú", meaning: "the menu" },
            { word: "la cuenta", meaning: "the bill" },
            { word: "el camarero", meaning: "the waiter" },
            { word: "la propina", meaning: "the tip" },
            { word: "el plato", meaning: "the plate" },
            { word: "el tenedor", meaning: "the fork" },
            { word: "el cuchillo", meaning: "the knife" },
          ],
          // Tastes & Descriptions
          [
            { word: "dulce", meaning: "sweet" },
            { word: "salado", meaning: "salty" },
            { word: "picante", meaning: "spicy" },
            { word: "delicioso", meaning: "delicious" },
            { word: "fresco", meaning: "fresh" },
            { word: "amargo", meaning: "bitter" },
            { word: "caliente", meaning: "hot" },
            { word: "frío", meaning: "cold" },
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
            { word: "la bicicleta", meaning: "the bicycle" },
            { word: "el taxi", meaning: "the taxi" },
          ],
          // Directions
          [
            { word: "izquierda", meaning: "left" },
            { word: "derecha", meaning: "right" },
            { word: "recto", meaning: "straight" },
            { word: "cerca", meaning: "near" },
            { word: "lejos", meaning: "far" },
            { word: "aquí", meaning: "here" },
            { word: "allí", meaning: "there" },
          ],
          // Places & Buildings
          [
            { word: "el aeropuerto", meaning: "the airport" },
            { word: "el hospital", meaning: "the hospital" },
            { word: "la escuela", meaning: "the school" },
            { word: "el banco", meaning: "the bank" },
            { word: "la tienda", meaning: "the shop" },
            { word: "la iglesia", meaning: "the church" },
            { word: "el museo", meaning: "the museum" },
            { word: "la biblioteca", meaning: "the library" },
          ],
          // Hotel & Accommodation
          [
            { word: "el hotel", meaning: "the hotel" },
            { word: "la habitación", meaning: "the room" },
            { word: "la reserva", meaning: "the reservation" },
            { word: "la recepción", meaning: "the reception" },
            { word: "el equipaje", meaning: "the luggage" },
            { word: "el ascensor", meaning: "the elevator" },
            { word: "la piscina", meaning: "the pool" },
          ],
          // Nature & Weather
          [
            { word: "el sol", meaning: "the sun" },
            { word: "la lluvia", meaning: "the rain" },
            { word: "el viento", meaning: "the wind" },
            { word: "la montaña", meaning: "the mountain" },
            { word: "el mar", meaning: "the sea" },
            { word: "la nube", meaning: "the cloud" },
            { word: "la nieve", meaning: "the snow" },
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
            { word: "buenas tardes", meaning: "good afternoon" },
            { word: "hasta mañana", meaning: "see you tomorrow" },
          ],
          // Introductions
          [
            { word: "me llamo", meaning: "my name is" },
            { word: "mucho gusto", meaning: "nice to meet you" },
            { word: "¿cómo estás?", meaning: "how are you?" },
            { word: "soy de", meaning: "I am from" },
            { word: "tengo … años", meaning: "I am … years old" },
            { word: "¿y tú?", meaning: "and you?" },
            { word: "vivo en", meaning: "I live in" },
          ],
          // Common Phrases
          [
            { word: "por favor", meaning: "please" },
            { word: "gracias", meaning: "thank you" },
            { word: "de nada", meaning: "you're welcome" },
            { word: "lo siento", meaning: "I'm sorry" },
            { word: "no entiendo", meaning: "I don't understand" },
            { word: "claro", meaning: "of course" },
            { word: "no sé", meaning: "I don't know" },
            { word: "está bien", meaning: "it's okay" },
          ],
          // Feelings & Emotions
          [
            { word: "feliz", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "enojado", meaning: "angry" },
            { word: "cansado", meaning: "tired" },
            { word: "emocionado", meaning: "excited" },
            { word: "nervioso", meaning: "nervous" },
            { word: "sorprendido", meaning: "surprised" },
          ],
          // Polite Expressions
          [
            { word: "con permiso", meaning: "excuse me" },
            { word: "disculpe", meaning: "pardon me" },
            { word: "¡salud!", meaning: "bless you! / cheers!" },
            { word: "buen provecho", meaning: "enjoy your meal" },
            { word: "¡buena suerte!", meaning: "good luck!" },
            { word: "con mucho gusto", meaning: "with pleasure" },
            { word: "igualmente", meaning: "likewise" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[5],
        description: "Work and study in Spanish",
        words: [
          // Professions
          [
            { word: "el maestro", meaning: "the teacher" },
            { word: "el doctor", meaning: "the doctor" },
            { word: "el ingeniero", meaning: "the engineer" },
            { word: "el estudiante", meaning: "the student" },
            { word: "el abogado", meaning: "the lawyer" },
            { word: "la enfermera", meaning: "the nurse" },
            { word: "el chef", meaning: "the chef" },
            { word: "el conductor", meaning: "the driver" },
          ],
          // Office & School
          [
            { word: "la computadora", meaning: "the computer" },
            { word: "el escritorio", meaning: "the desk" },
            { word: "el salón de clases", meaning: "the classroom" },
            { word: "la reunión", meaning: "the meeting" },
            { word: "la tarea", meaning: "the homework" },
            { word: "el proyecto", meaning: "the project" },
            { word: "el correo electrónico", meaning: "the email" },
            { word: "el lápiz", meaning: "the pencil" },
          ],
          // Technology
          [
            { word: "el internet", meaning: "the internet" },
            { word: "la contraseña", meaning: "the password" },
            { word: "el sitio web", meaning: "the website" },
            { word: "la aplicación", meaning: "the phone app" },
            { word: "descargar", meaning: "to download" },
            { word: "buscar", meaning: "to search" },
            { word: "la batería", meaning: "the battery" },
            { word: "la pantalla", meaning: "the screen" },
          ],
          // Meetings & Classes
          [
            { word: "el horario", meaning: "the schedule" },
            { word: "la presentación", meaning: "the presentation" },
            { word: "el examen", meaning: "the exam" },
            { word: "la calificación", meaning: "the grade" },
            { word: "el informe", meaning: "the report" },
            { word: "la fecha límite", meaning: "the deadline" },
            { word: "la pregunta", meaning: "the question" },
            { word: "la respuesta", meaning: "the answer" },
          ],
          // Goals & Plans
          [
            { word: "el sueño", meaning: "the dream" },
            { word: "el éxito", meaning: "the success" },
            { word: "el esfuerzo", meaning: "the effort" },
            { word: "el progreso", meaning: "the progress" },
            { word: "el futuro", meaning: "the future" },
            { word: "la carrera", meaning: "the career" },
            { word: "la meta", meaning: "the goal" },
            { word: "el plan", meaning: "the plan" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[6],
        description: "Shopping and money in Spanish",
        words: [
          // At the Store
          [
            { word: "el precio", meaning: "the price" },
            { word: "caro", meaning: "expensive" },
            { word: "barato", meaning: "cheap" },
            { word: "la oferta", meaning: "the sale" },
            { word: "el recibo", meaning: "the receipt" },
            { word: "el efectivo", meaning: "the cash" },
            { word: "el cambio", meaning: "the change" },
            { word: "la bolsa", meaning: "the bag" },
          ],
          // Prices & Bargaining
          [
            { word: "el descuento", meaning: "the discount" },
            { word: "¿cuánto cuesta?", meaning: "how much?" },
            { word: "el total", meaning: "the total" },
            { word: "pagar", meaning: "to pay" },
            { word: "el costo", meaning: "the cost" },
            { word: "gratis", meaning: "free" },
            { word: "la cartera", meaning: "the wallet" },
            { word: "la tarjeta de crédito", meaning: "the credit card" },
          ],
          // Clothing Shopping
          [
            { word: "la talla", meaning: "the size" },
            { word: "probarse", meaning: "to try on" },
            { word: "quedar bien", meaning: "to fit" },
            { word: "la camisa", meaning: "the shirt" },
            { word: "el vestido", meaning: "the dress" },
            { word: "los zapatos", meaning: "the shoes" },
            { word: "el sombrero", meaning: "the hat" },
            { word: "la chaqueta", meaning: "the jacket" },
          ],
          // Online Shopping
          [
            { word: "el pedido", meaning: "the order" },
            { word: "la entrega", meaning: "the delivery" },
            { word: "la devolución", meaning: "the return" },
            { word: "la reseña", meaning: "the review" },
            { word: "el carrito", meaning: "the cart" },
            { word: "pagar en línea", meaning: "to checkout" },
            { word: "el paquete", meaning: "the package" },
            { word: "la dirección", meaning: "the address" },
          ],
          // Banking & Finance
          [
            { word: "el banco", meaning: "the bank" },
            { word: "la cuenta", meaning: "the account" },
            { word: "ahorrar", meaning: "to save" },
            { word: "gastar", meaning: "to spend" },
            { word: "el dinero", meaning: "the money" },
            { word: "el préstamo", meaning: "the loan" },
            { word: "la factura", meaning: "the bill" },
            { word: "la transferencia", meaning: "the transfer" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[7],
        description: "Entertainment in Spanish",
        words: [
          // Music & Dance
          [
            { word: "la canción", meaning: "the song" },
            { word: "el cantante", meaning: "the singer" },
            { word: "la guitarra", meaning: "the guitar" },
            { word: "el piano", meaning: "the piano" },
            { word: "el concierto", meaning: "the concert" },
            { word: "el baile", meaning: "the dance" },
            { word: "el ritmo", meaning: "the rhythm" },
            { word: "la banda", meaning: "the band" },
          ],
          // Sports & Fitness
          [
            { word: "el fútbol", meaning: "soccer" },
            { word: "el baloncesto", meaning: "basketball" },
            { word: "nadar", meaning: "to swim" },
            { word: "correr", meaning: "to run" },
            { word: "el gimnasio", meaning: "the gym" },
            { word: "el equipo", meaning: "the team" },
            { word: "el partido", meaning: "the match" },
            { word: "el ejercicio", meaning: "the exercise" },
          ],
          // Movies & TV
          [
            { word: "la película", meaning: "the movie" },
            { word: "el actor", meaning: "the actor" },
            { word: "la historia", meaning: "the story" },
            { word: "gracioso", meaning: "funny" },
            { word: "de miedo", meaning: "scary" },
            { word: "la serie", meaning: "the series" },
            { word: "la entrada", meaning: "the ticket" },
            { word: "el espectáculo", meaning: "the show" },
          ],
          // Games & Hobbies
          [
            { word: "el juego", meaning: "the game" },
            { word: "jugar", meaning: "to play" },
            { word: "dibujar", meaning: "to draw" },
            { word: "pintar", meaning: "to paint" },
            { word: "leer", meaning: "to read" },
            { word: "el jardín", meaning: "the garden" },
            { word: "el rompecabezas", meaning: "the puzzle" },
            { word: "la cámara", meaning: "the camera" },
          ],
          // Celebrations & Events
          [
            { word: "la fiesta", meaning: "the party" },
            { word: "el cumpleaños", meaning: "the birthday" },
            { word: "el regalo", meaning: "the gift" },
            { word: "celebrar", meaning: "to celebrate" },
            { word: "el feriado", meaning: "the holiday" },
            { word: "la boda", meaning: "the wedding" },
            { word: "el festival", meaning: "the festival" },
            { word: "los fuegos artificiales", meaning: "the fireworks" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[8],
        description: "Social life in Spanish",
        words: [
          // Making Friends
          [
            { word: "el amigo", meaning: "the friend" },
            { word: "conocer", meaning: "to meet" },
            { word: "presentar", meaning: "to introduce" },
            { word: "amable", meaning: "nice" },
            { word: "juntos", meaning: "together" },
            { word: "el vecino", meaning: "the neighbor" },
            { word: "el grupo", meaning: "the group" },
            { word: "invitar", meaning: "to invite" },
          ],
          // Invitations & Plans
          [
            { word: "mañana", meaning: "tomorrow" },
            { word: "esta noche", meaning: "tonight" },
            { word: "el fin de semana", meaning: "the weekend" },
            { word: "disponible", meaning: "available" },
            { word: "unirse", meaning: "to join" },
            { word: "la fiesta", meaning: "the party" },
            { word: "la cena", meaning: "the dinner" },
            { word: "visitar", meaning: "to visit" },
          ],
          // Feelings & Moods
          [
            { word: "feliz", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "enojado", meaning: "angry" },
            { word: "cansado", meaning: "tired" },
            { word: "emocionado", meaning: "excited" },
            { word: "nervioso", meaning: "nervous" },
            { word: "sorprendido", meaning: "surprised" },
            { word: "tranquilo", meaning: "calm" },
          ],
          // Communication
          [
            { word: "hablar", meaning: "to talk" },
            { word: "escuchar", meaning: "to listen" },
            { word: "el mensaje", meaning: "the message" },
            { word: "llamar", meaning: "to call" },
            { word: "entender", meaning: "to understand" },
            { word: "estar de acuerdo", meaning: "to agree" },
            { word: "no estar de acuerdo", meaning: "to disagree" },
            { word: "explicar", meaning: "to explain" },
          ],
          // Relationships
          [
            { word: "el amor", meaning: "love" },
            { word: "la familia", meaning: "the family" },
            { word: "la confianza", meaning: "trust" },
            { word: "el respeto", meaning: "respect" },
            { word: "casarse", meaning: "to marry" },
            { word: "la pareja", meaning: "the partner" },
            { word: "extrañar", meaning: "to miss" },
            { word: "cuidar", meaning: "to care" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[9],
        description: "Advanced phrases in Spanish",
        words: [
          // Opinions & Beliefs
          [
            { word: "yo creo", meaning: "I think" },
            { word: "yo pienso", meaning: "I believe" },
            { word: "en mi opinión", meaning: "in my opinion" },
            { word: "de acuerdo", meaning: "agree" },
            { word: "en desacuerdo", meaning: "disagree" },
            { word: "tal vez", meaning: "maybe" },
            { word: "seguramente", meaning: "certainly" },
            { word: "probablemente", meaning: "probably" },
          ],
          // Comparisons
          [
            { word: "mejor", meaning: "better" },
            { word: "peor", meaning: "worse" },
            { word: "igual", meaning: "same" },
            { word: "diferente", meaning: "different" },
            { word: "más", meaning: "more" },
            { word: "menos", meaning: "less" },
            { word: "similar", meaning: "similar" },
            { word: "equivalente", meaning: "equal" },
          ],
          // Requests & Offers
          [
            { word: "¿podría usted?", meaning: "could you?" },
            { word: "por favor", meaning: "please" },
            { word: "¿le importaría?", meaning: "would you mind?" },
            { word: "ayudar", meaning: "to help" },
            { word: "necesitar", meaning: "to need" },
            { word: "ofrecer", meaning: "to offer" },
            { word: "sugerir", meaning: "to suggest" },
            { word: "recomendar", meaning: "to recommend" },
          ],
          // Cause & Effect
          [
            { word: "porque", meaning: "because" },
            { word: "por lo tanto", meaning: "therefore" },
            { word: "para que", meaning: "so that" },
            { word: "el resultado", meaning: "the result" },
            { word: "la razón", meaning: "the reason" },
            { word: "llevar a", meaning: "to lead to" },
            { word: "debido a", meaning: "due to" },
            { word: "la consecuencia", meaning: "the consequence" },
          ],
          // Common Idioms
          [
            { word: "romper el hielo", meaning: "break the ice" },
            { word: "pan comido", meaning: "piece of cake" },
            { word: "estar pachucho", meaning: "under the weather" },
            { word: "ponerse en marcha", meaning: "hit the road" },
            { word: "tener sentido", meaning: "make sense" },
            { word: "tómalo con calma", meaning: "take it easy" },
            { word: "no es gran cosa", meaning: "no big deal" },
            { word: "dar por terminado", meaning: "call it a day" },
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
            { word: "il padre", meaning: "the father" },
            { word: "il fratello", meaning: "the brother" },
            { word: "la sorella", meaning: "the sister" },
          ],
          [
            { word: "uno", meaning: "one" },
            { word: "due", meaning: "two" },
            { word: "tre", meaning: "three" },
            { word: "quattro", meaning: "four" },
            { word: "cinque", meaning: "five" },
            { word: "sei", meaning: "six" },
            { word: "sette", meaning: "seven" },
          ],
          [
            { word: "rosso", meaning: "red" },
            { word: "blu", meaning: "blue" },
            { word: "verde", meaning: "green" },
            { word: "giallo", meaning: "yellow" },
            { word: "nero", meaning: "black" },
            { word: "bianco", meaning: "white" },
            { word: "viola", meaning: "purple" },
          ],
          [
            { word: "il libro", meaning: "the book" },
            { word: "il tavolo", meaning: "the table" },
            { word: "la sedia", meaning: "the chair" },
            { word: "il telefono", meaning: "the phone" },
            { word: "la chiave", meaning: "the key" },
            { word: "l'orologio", meaning: "the clock" },
            { word: "la finestra", meaning: "the window" },
          ],
          [
            { word: "grande", meaning: "big" },
            { word: "piccolo", meaning: "small" },
            { word: "buono", meaning: "good" },
            { word: "cattivo", meaning: "bad" },
            { word: "nuovo", meaning: "new" },
            { word: "vecchio", meaning: "old" },
            { word: "bello", meaning: "pretty" },
            { word: "brutto", meaning: "ugly" },
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
            { word: "la finestra", meaning: "the window" },
            { word: "il giardino", meaning: "the garden" },
          ],
          [
            { word: "mangiare", meaning: "to eat" },
            { word: "bere", meaning: "to drink" },
            { word: "dormire", meaning: "to sleep" },
            { word: "correre", meaning: "to run" },
            { word: "parlare", meaning: "to speak" },
            { word: "leggere", meaning: "to read" },
            { word: "scrivere", meaning: "to write" },
            { word: "camminare", meaning: "to walk" },
          ],
          [
            { word: "lunedì", meaning: "Monday" },
            { word: "martedì", meaning: "Tuesday" },
            { word: "oggi", meaning: "today" },
            { word: "domani", meaning: "tomorrow" },
            { word: "l'ora", meaning: "the hour" },
            { word: "mercoledì", meaning: "Wednesday" },
            { word: "ieri", meaning: "yesterday" },
          ],
          [
            { word: "la camicia", meaning: "the shirt" },
            { word: "le scarpe", meaning: "the shoes" },
            { word: "il cappello", meaning: "the hat" },
            { word: "la gonna", meaning: "the skirt" },
            { word: "il cappotto", meaning: "the coat" },
            { word: "i pantaloni", meaning: "the pants" },
            { word: "il vestito", meaning: "the dress" },
          ],
          [
            { word: "la testa", meaning: "the head" },
            { word: "la mano", meaning: "the hand" },
            { word: "l'occhio", meaning: "the eye" },
            { word: "il cuore", meaning: "the heart" },
            { word: "la bocca", meaning: "the mouth" },
            { word: "il naso", meaning: "the nose" },
            { word: "il braccio", meaning: "the arm" },
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
            { word: "la fragola", meaning: "the strawberry" },
            { word: "la cipolla", meaning: "the onion" },
          ],
          [
            { word: "la colazione", meaning: "breakfast" },
            { word: "il pranzo", meaning: "lunch" },
            { word: "la cena", meaning: "dinner" },
            { word: "il riso", meaning: "rice" },
            { word: "il pane", meaning: "bread" },
            { word: "la zuppa", meaning: "the soup" },
            { word: "l'uovo", meaning: "the egg" },
            { word: "il sale", meaning: "the salt" },
          ],
          [
            { word: "l'acqua", meaning: "water" },
            { word: "il latte", meaning: "milk" },
            { word: "il caffè", meaning: "coffee" },
            { word: "il succo", meaning: "juice" },
            { word: "il tè", meaning: "tea" },
            { word: "la birra", meaning: "the beer" },
            { word: "il vino", meaning: "the wine" },
          ],
          [
            { word: "il menù", meaning: "the menu" },
            { word: "il conto", meaning: "the bill" },
            { word: "il cameriere", meaning: "the waiter" },
            { word: "la mancia", meaning: "the tip" },
            { word: "il piatto", meaning: "the plate" },
            { word: "la forchetta", meaning: "the fork" },
            { word: "il coltello", meaning: "the knife" },
          ],
          [
            { word: "dolce", meaning: "sweet" },
            { word: "salato", meaning: "salty" },
            { word: "piccante", meaning: "spicy" },
            { word: "delizioso", meaning: "delicious" },
            { word: "fresco", meaning: "fresh" },
            { word: "amaro", meaning: "bitter" },
            { word: "caldo", meaning: "hot" },
            { word: "freddo", meaning: "cold" },
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
            { word: "la bicicletta", meaning: "the bicycle" },
            { word: "il taxi", meaning: "the taxi" },
          ],
          [
            { word: "sinistra", meaning: "left" },
            { word: "destra", meaning: "right" },
            { word: "dritto", meaning: "straight" },
            { word: "vicino", meaning: "near" },
            { word: "lontano", meaning: "far" },
            { word: "qui", meaning: "here" },
            { word: "là", meaning: "there" },
          ],
          [
            { word: "l'aeroporto", meaning: "the airport" },
            { word: "l'ospedale", meaning: "the hospital" },
            { word: "la scuola", meaning: "the school" },
            { word: "la banca", meaning: "the bank" },
            { word: "il negozio", meaning: "the shop" },
            { word: "la chiesa", meaning: "the church" },
            { word: "il museo", meaning: "the museum" },
            { word: "la biblioteca", meaning: "the library" },
          ],
          [
            { word: "l'albergo", meaning: "the hotel" },
            { word: "la camera", meaning: "the room" },
            { word: "la prenotazione", meaning: "the reservation" },
            { word: "la reception", meaning: "the reception" },
            { word: "il bagaglio", meaning: "the luggage" },
            { word: "l'ascensore", meaning: "the elevator" },
            { word: "la piscina", meaning: "the pool" },
          ],
          [
            { word: "il sole", meaning: "the sun" },
            { word: "la pioggia", meaning: "the rain" },
            { word: "il vento", meaning: "the wind" },
            { word: "la montagna", meaning: "the mountain" },
            { word: "il mare", meaning: "the sea" },
            { word: "la nuvola", meaning: "the cloud" },
            { word: "la neve", meaning: "the snow" },
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
            { word: "buon pomeriggio", meaning: "good afternoon" },
            { word: "a domani", meaning: "see you tomorrow" },
          ],
          [
            { word: "mi chiamo", meaning: "my name is" },
            { word: "piacere", meaning: "nice to meet you" },
            { word: "come stai?", meaning: "how are you?" },
            { word: "sono di", meaning: "I am from" },
            { word: "ho … anni", meaning: "I am … years old" },
            { word: "e tu?", meaning: "and you?" },
            { word: "abito a", meaning: "I live in" },
          ],
          [
            { word: "per favore", meaning: "please" },
            { word: "grazie", meaning: "thank you" },
            { word: "prego", meaning: "you're welcome" },
            { word: "mi dispiace", meaning: "I'm sorry" },
            { word: "non capisco", meaning: "I don't understand" },
            { word: "certo", meaning: "of course" },
            { word: "non lo so", meaning: "I don't know" },
            { word: "va bene", meaning: "it's okay" },
          ],
          [
            { word: "felice", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "arrabbiato", meaning: "angry" },
            { word: "stanco", meaning: "tired" },
            { word: "emozionato", meaning: "excited" },
            { word: "nervoso", meaning: "nervous" },
            { word: "sorpreso", meaning: "surprised" },
          ],
          [
            { word: "permesso", meaning: "excuse me" },
            { word: "scusi", meaning: "pardon me" },
            { word: "salute!", meaning: "bless you! / cheers!" },
            { word: "buon appetito", meaning: "enjoy your meal" },
            { word: "in bocca al lupo!", meaning: "good luck!" },
            { word: "con piacere", meaning: "with pleasure" },
            { word: "altrettanto", meaning: "likewise" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[5],
        description: "Work and study in Italian",
        words: [
          // Professions
          [
            { word: "l'insegnante", meaning: "the teacher" },
            { word: "il dottore", meaning: "the doctor" },
            { word: "l'ingegnere", meaning: "the engineer" },
            { word: "lo studente", meaning: "the student" },
            { word: "l'avvocato", meaning: "the lawyer" },
            { word: "l'infermiere", meaning: "the nurse" },
            { word: "lo chef", meaning: "the chef" },
            { word: "l'autista", meaning: "the driver" },
          ],
          // Office & School
          [
            { word: "il computer", meaning: "the computer" },
            { word: "la scrivania", meaning: "the desk" },
            { word: "l'aula", meaning: "the classroom" },
            { word: "la riunione", meaning: "the meeting" },
            { word: "i compiti", meaning: "the homework" },
            { word: "il progetto", meaning: "the project" },
            { word: "l'email", meaning: "the email" },
            { word: "la matita", meaning: "the pencil" },
          ],
          // Technology
          [
            { word: "l'internet", meaning: "the internet" },
            { word: "la password", meaning: "the password" },
            { word: "il sito web", meaning: "the website" },
            { word: "l'applicazione", meaning: "the phone app" },
            { word: "scaricare", meaning: "to download" },
            { word: "cercare", meaning: "to search" },
            { word: "la batteria", meaning: "the battery" },
            { word: "lo schermo", meaning: "the screen" },
          ],
          // Meetings & Classes
          [
            { word: "l'orario", meaning: "the schedule" },
            { word: "la presentazione", meaning: "the presentation" },
            { word: "l'esame", meaning: "the exam" },
            { word: "il voto", meaning: "the grade" },
            { word: "il rapporto", meaning: "the report" },
            { word: "la scadenza", meaning: "the deadline" },
            { word: "la domanda", meaning: "the question" },
            { word: "la risposta", meaning: "the answer" },
          ],
          // Goals & Plans
          [
            { word: "il sogno", meaning: "the dream" },
            { word: "il successo", meaning: "the success" },
            { word: "lo sforzo", meaning: "the effort" },
            { word: "il progresso", meaning: "the progress" },
            { word: "il futuro", meaning: "the future" },
            { word: "la carriera", meaning: "the career" },
            { word: "l'obiettivo", meaning: "the goal" },
            { word: "il piano", meaning: "the plan" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[6],
        description: "Shopping and money in Italian",
        words: [
          // At the Store
          [
            { word: "il prezzo", meaning: "the price" },
            { word: "costoso", meaning: "expensive" },
            { word: "economico", meaning: "cheap" },
            { word: "i saldi", meaning: "the sale" },
            { word: "lo scontrino", meaning: "the receipt" },
            { word: "i contanti", meaning: "the cash" },
            { word: "il resto", meaning: "the change" },
            { word: "la borsa", meaning: "the bag" },
          ],
          // Prices & Bargaining
          [
            { word: "lo sconto", meaning: "the discount" },
            { word: "quanto costa?", meaning: "how much?" },
            { word: "il totale", meaning: "the total" },
            { word: "pagare", meaning: "to pay" },
            { word: "il costo", meaning: "the cost" },
            { word: "gratuito", meaning: "free" },
            { word: "il portafoglio", meaning: "the wallet" },
            { word: "la carta di credito", meaning: "the credit card" },
          ],
          // Clothing Shopping
          [
            { word: "la taglia", meaning: "the size" },
            { word: "provare", meaning: "to try on" },
            { word: "andare bene", meaning: "to fit" },
            { word: "la camicia", meaning: "the shirt" },
            { word: "il vestito", meaning: "the dress" },
            { word: "le scarpe", meaning: "the shoes" },
            { word: "il cappello", meaning: "the hat" },
            { word: "la giacca", meaning: "the jacket" },
          ],
          // Online Shopping
          [
            { word: "l'ordine", meaning: "the order" },
            { word: "la consegna", meaning: "the delivery" },
            { word: "il reso", meaning: "the return" },
            { word: "la recensione", meaning: "the review" },
            { word: "il carrello", meaning: "the cart" },
            { word: "il pagamento", meaning: "to checkout" },
            { word: "il pacco", meaning: "the package" },
            { word: "l'indirizzo", meaning: "the address" },
          ],
          // Banking & Finance
          [
            { word: "la banca", meaning: "the bank" },
            { word: "il conto", meaning: "the account" },
            { word: "risparmiare", meaning: "to save" },
            { word: "spendere", meaning: "to spend" },
            { word: "i soldi", meaning: "the money" },
            { word: "il prestito", meaning: "the loan" },
            { word: "la bolletta", meaning: "the bill" },
            { word: "il bonifico", meaning: "the transfer" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[7],
        description: "Entertainment in Italian",
        words: [
          // Music & Dance
          [
            { word: "la canzone", meaning: "the song" },
            { word: "il cantante", meaning: "the singer" },
            { word: "la chitarra", meaning: "the guitar" },
            { word: "il pianoforte", meaning: "the piano" },
            { word: "il concerto", meaning: "the concert" },
            { word: "la danza", meaning: "the dance" },
            { word: "il ritmo", meaning: "the rhythm" },
            { word: "la band", meaning: "the band" },
          ],
          // Sports & Fitness
          [
            { word: "il calcio", meaning: "soccer" },
            { word: "la pallacanestro", meaning: "basketball" },
            { word: "nuotare", meaning: "to swim" },
            { word: "correre", meaning: "to run" },
            { word: "la palestra", meaning: "the gym" },
            { word: "la squadra", meaning: "the team" },
            { word: "la partita", meaning: "the match" },
            { word: "l'esercizio", meaning: "the exercise" },
          ],
          // Movies & TV
          [
            { word: "il film", meaning: "the movie" },
            { word: "l'attore", meaning: "the actor" },
            { word: "la storia", meaning: "the story" },
            { word: "divertente", meaning: "funny" },
            { word: "spaventoso", meaning: "scary" },
            { word: "la serie", meaning: "the series" },
            { word: "il biglietto", meaning: "the ticket" },
            { word: "lo spettacolo", meaning: "the show" },
          ],
          // Games & Hobbies
          [
            { word: "il gioco", meaning: "the game" },
            { word: "giocare", meaning: "to play" },
            { word: "disegnare", meaning: "to draw" },
            { word: "dipingere", meaning: "to paint" },
            { word: "leggere", meaning: "to read" },
            { word: "il giardino", meaning: "the garden" },
            { word: "il puzzle", meaning: "the puzzle" },
            { word: "la fotocamera", meaning: "the camera" },
          ],
          // Celebrations & Events
          [
            { word: "la festa", meaning: "the party" },
            { word: "il compleanno", meaning: "the birthday" },
            { word: "il regalo", meaning: "the gift" },
            { word: "festeggiare", meaning: "to celebrate" },
            { word: "la vacanza", meaning: "the holiday" },
            { word: "il matrimonio", meaning: "the wedding" },
            { word: "il festival", meaning: "the festival" },
            { word: "i fuochi d'artificio", meaning: "the fireworks" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[8],
        description: "Social life in Italian",
        words: [
          // Making Friends
          [
            { word: "l'amico", meaning: "the friend" },
            { word: "incontrare", meaning: "to meet" },
            { word: "presentare", meaning: "to introduce" },
            { word: "gentile", meaning: "nice" },
            { word: "insieme", meaning: "together" },
            { word: "il vicino", meaning: "the neighbor" },
            { word: "il gruppo", meaning: "the group" },
            { word: "invitare", meaning: "to invite" },
          ],
          // Invitations & Plans
          [
            { word: "domani", meaning: "tomorrow" },
            { word: "stasera", meaning: "tonight" },
            { word: "il fine settimana", meaning: "the weekend" },
            { word: "disponibile", meaning: "available" },
            { word: "unirsi", meaning: "to join" },
            { word: "la festa", meaning: "the party" },
            { word: "la cena", meaning: "the dinner" },
            { word: "visitare", meaning: "to visit" },
          ],
          // Feelings & Moods
          [
            { word: "felice", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "arrabbiato", meaning: "angry" },
            { word: "stanco", meaning: "tired" },
            { word: "emozionato", meaning: "excited" },
            { word: "nervoso", meaning: "nervous" },
            { word: "sorpreso", meaning: "surprised" },
            { word: "calmo", meaning: "calm" },
          ],
          // Communication
          [
            { word: "parlare", meaning: "to talk" },
            { word: "ascoltare", meaning: "to listen" },
            { word: "il messaggio", meaning: "the message" },
            { word: "chiamare", meaning: "to call" },
            { word: "capire", meaning: "to understand" },
            { word: "essere d'accordo", meaning: "to agree" },
            { word: "non essere d'accordo", meaning: "to disagree" },
            { word: "spiegare", meaning: "to explain" },
          ],
          // Relationships
          [
            { word: "l'amore", meaning: "love" },
            { word: "la famiglia", meaning: "the family" },
            { word: "la fiducia", meaning: "trust" },
            { word: "il rispetto", meaning: "respect" },
            { word: "sposarsi", meaning: "to marry" },
            { word: "il partner", meaning: "the partner" },
            { word: "mancare", meaning: "to miss" },
            { word: "prendersi cura", meaning: "to care" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[9],
        description: "Advanced phrases in Italian",
        words: [
          // Opinions & Beliefs
          [
            { word: "penso che", meaning: "I think" },
            { word: "credo che", meaning: "I believe" },
            { word: "secondo me", meaning: "in my opinion" },
            { word: "d'accordo", meaning: "agree" },
            { word: "in disaccordo", meaning: "disagree" },
            { word: "forse", meaning: "maybe" },
            { word: "certamente", meaning: "certainly" },
            { word: "probabilmente", meaning: "probably" },
          ],
          // Comparisons
          [
            { word: "migliore", meaning: "better" },
            { word: "peggiore", meaning: "worse" },
            { word: "uguale", meaning: "same" },
            { word: "diverso", meaning: "different" },
            { word: "di più", meaning: "more" },
            { word: "di meno", meaning: "less" },
            { word: "simile", meaning: "similar" },
            { word: "pari", meaning: "equal" },
          ],
          // Requests & Offers
          [
            { word: "potrebbe?", meaning: "could you?" },
            { word: "per favore", meaning: "please" },
            { word: "le dispiacerebbe?", meaning: "would you mind?" },
            { word: "aiutare", meaning: "to help" },
            { word: "avere bisogno", meaning: "to need" },
            { word: "offrire", meaning: "to offer" },
            { word: "suggerire", meaning: "to suggest" },
            { word: "raccomandare", meaning: "to recommend" },
          ],
          // Cause & Effect
          [
            { word: "perché", meaning: "because" },
            { word: "quindi", meaning: "therefore" },
            { word: "affinché", meaning: "so that" },
            { word: "il risultato", meaning: "the result" },
            { word: "la ragione", meaning: "the reason" },
            { word: "portare a", meaning: "to lead to" },
            { word: "a causa di", meaning: "due to" },
            { word: "la conseguenza", meaning: "the consequence" },
          ],
          // Common Idioms
          [
            { word: "rompere il ghiaccio", meaning: "break the ice" },
            { word: "un gioco da ragazzi", meaning: "piece of cake" },
            { word: "sentirsi poco bene", meaning: "under the weather" },
            { word: "mettersi in viaggio", meaning: "hit the road" },
            { word: "avere senso", meaning: "make sense" },
            { word: "prendila con calma", meaning: "take it easy" },
            { word: "non è un gran problema", meaning: "no big deal" },
            { word: "chiudiamola qui", meaning: "call it a day" },
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
            { word: "le père", meaning: "the father" },
            { word: "le frère", meaning: "the brother" },
            { word: "la sœur", meaning: "the sister" },
          ],
          [
            { word: "un", meaning: "one" },
            { word: "deux", meaning: "two" },
            { word: "trois", meaning: "three" },
            { word: "quatre", meaning: "four" },
            { word: "cinq", meaning: "five" },
            { word: "six", meaning: "six" },
            { word: "sept", meaning: "seven" },
          ],
          [
            { word: "rouge", meaning: "red" },
            { word: "bleu", meaning: "blue" },
            { word: "vert", meaning: "green" },
            { word: "jaune", meaning: "yellow" },
            { word: "noir", meaning: "black" },
            { word: "blanc", meaning: "white" },
            { word: "violet", meaning: "purple" },
          ],
          [
            { word: "le livre", meaning: "the book" },
            { word: "la table", meaning: "the table" },
            { word: "la chaise", meaning: "the chair" },
            { word: "le téléphone", meaning: "the phone" },
            { word: "la clé", meaning: "the key" },
            { word: "l'horloge", meaning: "the clock" },
            { word: "la fenêtre", meaning: "the window" },
          ],
          [
            { word: "grand", meaning: "big" },
            { word: "petit", meaning: "small" },
            { word: "bon", meaning: "good" },
            { word: "mauvais", meaning: "bad" },
            { word: "nouveau", meaning: "new" },
            { word: "vieux", meaning: "old" },
            { word: "joli", meaning: "pretty" },
            { word: "laid", meaning: "ugly" },
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
            { word: "la fenêtre", meaning: "the window" },
            { word: "le jardin", meaning: "the garden" },
          ],
          [
            { word: "manger", meaning: "to eat" },
            { word: "boire", meaning: "to drink" },
            { word: "dormir", meaning: "to sleep" },
            { word: "courir", meaning: "to run" },
            { word: "parler", meaning: "to speak" },
            { word: "lire", meaning: "to read" },
            { word: "écrire", meaning: "to write" },
            { word: "marcher", meaning: "to walk" },
          ],
          [
            { word: "lundi", meaning: "Monday" },
            { word: "mardi", meaning: "Tuesday" },
            { word: "aujourd'hui", meaning: "today" },
            { word: "demain", meaning: "tomorrow" },
            { word: "l'heure", meaning: "the hour" },
            { word: "mercredi", meaning: "Wednesday" },
            { word: "hier", meaning: "yesterday" },
          ],
          [
            { word: "la chemise", meaning: "the shirt" },
            { word: "les chaussures", meaning: "the shoes" },
            { word: "le chapeau", meaning: "the hat" },
            { word: "la jupe", meaning: "the skirt" },
            { word: "le manteau", meaning: "the coat" },
            { word: "le pantalon", meaning: "the pants" },
            { word: "la robe", meaning: "the dress" },
          ],
          [
            { word: "la tête", meaning: "the head" },
            { word: "la main", meaning: "the hand" },
            { word: "l'œil", meaning: "the eye" },
            { word: "le cœur", meaning: "the heart" },
            { word: "la bouche", meaning: "the mouth" },
            { word: "le nez", meaning: "the nose" },
            { word: "le bras", meaning: "the arm" },
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
            { word: "la fraise", meaning: "the strawberry" },
            { word: "l'oignon", meaning: "the onion" },
          ],
          [
            { word: "le petit déjeuner", meaning: "breakfast" },
            { word: "le déjeuner", meaning: "lunch" },
            { word: "le dîner", meaning: "dinner" },
            { word: "le riz", meaning: "rice" },
            { word: "le pain", meaning: "bread" },
            { word: "la soupe", meaning: "the soup" },
            { word: "l'œuf", meaning: "the egg" },
            { word: "le sel", meaning: "the salt" },
          ],
          [
            { word: "l'eau", meaning: "water" },
            { word: "le lait", meaning: "milk" },
            { word: "le café", meaning: "coffee" },
            { word: "le jus", meaning: "juice" },
            { word: "le thé", meaning: "tea" },
            { word: "la bière", meaning: "the beer" },
            { word: "le vin", meaning: "the wine" },
          ],
          [
            { word: "le menu", meaning: "the menu" },
            { word: "l'addition", meaning: "the bill" },
            { word: "le serveur", meaning: "the waiter" },
            { word: "le pourboire", meaning: "the tip" },
            { word: "l'assiette", meaning: "the plate" },
            { word: "la fourchette", meaning: "the fork" },
            { word: "le couteau", meaning: "the knife" },
          ],
          [
            { word: "sucré", meaning: "sweet" },
            { word: "salé", meaning: "salty" },
            { word: "épicé", meaning: "spicy" },
            { word: "délicieux", meaning: "delicious" },
            { word: "frais", meaning: "fresh" },
            { word: "amer", meaning: "bitter" },
            { word: "chaud", meaning: "hot" },
            { word: "froid", meaning: "cold" },
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
            { word: "le vélo", meaning: "the bicycle" },
            { word: "le taxi", meaning: "the taxi" },
          ],
          [
            { word: "à gauche", meaning: "left" },
            { word: "à droite", meaning: "right" },
            { word: "tout droit", meaning: "straight" },
            { word: "près", meaning: "near" },
            { word: "loin", meaning: "far" },
            { word: "ici", meaning: "here" },
            { word: "là-bas", meaning: "there" },
          ],
          [
            { word: "l'aéroport", meaning: "the airport" },
            { word: "l'hôpital", meaning: "the hospital" },
            { word: "l'école", meaning: "the school" },
            { word: "la banque", meaning: "the bank" },
            { word: "le magasin", meaning: "the shop" },
            { word: "l'église", meaning: "the church" },
            { word: "le musée", meaning: "the museum" },
            { word: "la bibliothèque", meaning: "the library" },
          ],
          [
            { word: "l'hôtel", meaning: "the hotel" },
            { word: "la chambre", meaning: "the room" },
            { word: "la réservation", meaning: "the reservation" },
            { word: "la réception", meaning: "the reception" },
            { word: "les bagages", meaning: "the luggage" },
            { word: "l'ascenseur", meaning: "the elevator" },
            { word: "la piscine", meaning: "the pool" },
          ],
          [
            { word: "le soleil", meaning: "the sun" },
            { word: "la pluie", meaning: "the rain" },
            { word: "le vent", meaning: "the wind" },
            { word: "la montagne", meaning: "the mountain" },
            { word: "la mer", meaning: "the sea" },
            { word: "le nuage", meaning: "the cloud" },
            { word: "la neige", meaning: "the snow" },
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
            { word: "bon après-midi", meaning: "good afternoon" },
            { word: "à demain", meaning: "see you tomorrow" },
          ],
          [
            { word: "je m'appelle", meaning: "my name is" },
            { word: "enchanté", meaning: "nice to meet you" },
            { word: "comment allez-vous?", meaning: "how are you?" },
            { word: "je viens de", meaning: "I am from" },
            { word: "j'ai … ans", meaning: "I am … years old" },
            { word: "et vous?", meaning: "and you?" },
            { word: "j'habite à", meaning: "I live in" },
          ],
          [
            { word: "s'il vous plaît", meaning: "please" },
            { word: "merci", meaning: "thank you" },
            { word: "de rien", meaning: "you're welcome" },
            { word: "je suis désolé", meaning: "I'm sorry" },
            { word: "je ne comprends pas", meaning: "I don't understand" },
            { word: "bien sûr", meaning: "of course" },
            { word: "je ne sais pas", meaning: "I don't know" },
            { word: "ça va", meaning: "it's okay" },
          ],
          [
            { word: "heureux", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "en colère", meaning: "angry" },
            { word: "fatigué", meaning: "tired" },
            { word: "excité", meaning: "excited" },
            { word: "nerveux", meaning: "nervous" },
            { word: "surpris", meaning: "surprised" },
          ],
          [
            { word: "excusez-moi", meaning: "excuse me" },
            { word: "pardon", meaning: "pardon me" },
            { word: "à vos souhaits!", meaning: "bless you! / cheers!" },
            { word: "bon appétit", meaning: "enjoy your meal" },
            { word: "bonne chance!", meaning: "good luck!" },
            { word: "avec plaisir", meaning: "with pleasure" },
            { word: "également", meaning: "likewise" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[5],
        description: "Work and study in French",
        words: [
          // Professions
          [
            { word: "le professeur", meaning: "the teacher" },
            { word: "le médecin", meaning: "the doctor" },
            { word: "l'ingénieur", meaning: "the engineer" },
            { word: "l'étudiant", meaning: "the student" },
            { word: "l'avocat", meaning: "the lawyer" },
            { word: "l'infirmier", meaning: "the nurse" },
            { word: "le chef cuisinier", meaning: "the chef" },
            { word: "le chauffeur", meaning: "the driver" },
          ],
          // Office & School
          [
            { word: "l'ordinateur", meaning: "the computer" },
            { word: "le bureau", meaning: "the desk" },
            { word: "la salle de classe", meaning: "the classroom" },
            { word: "la réunion", meaning: "the meeting" },
            { word: "les devoirs", meaning: "the homework" },
            { word: "le projet", meaning: "the project" },
            { word: "le courriel", meaning: "the email" },
            { word: "le crayon", meaning: "the pencil" },
          ],
          // Technology
          [
            { word: "l'internet", meaning: "the internet" },
            { word: "le mot de passe", meaning: "the password" },
            { word: "le site web", meaning: "the website" },
            { word: "l'application", meaning: "the phone app" },
            { word: "télécharger", meaning: "to download" },
            { word: "chercher", meaning: "to search" },
            { word: "la batterie", meaning: "the battery" },
            { word: "l'écran", meaning: "the screen" },
          ],
          // Meetings & Classes
          [
            { word: "l'emploi du temps", meaning: "the schedule" },
            { word: "la présentation", meaning: "the presentation" },
            { word: "l'examen", meaning: "the exam" },
            { word: "la note", meaning: "the grade" },
            { word: "le rapport", meaning: "the report" },
            { word: "la date limite", meaning: "the deadline" },
            { word: "la question", meaning: "the question" },
            { word: "la réponse", meaning: "the answer" },
          ],
          // Goals & Plans
          [
            { word: "le rêve", meaning: "the dream" },
            { word: "le succès", meaning: "the success" },
            { word: "l'effort", meaning: "the effort" },
            { word: "le progrès", meaning: "the progress" },
            { word: "l'avenir", meaning: "the future" },
            { word: "la carrière", meaning: "the career" },
            { word: "l'objectif", meaning: "the goal" },
            { word: "le plan", meaning: "the plan" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[6],
        description: "Shopping and money in French",
        words: [
          // At the Store
          [
            { word: "le prix", meaning: "the price" },
            { word: "cher", meaning: "expensive" },
            { word: "bon marché", meaning: "cheap" },
            { word: "les soldes", meaning: "the sale" },
            { word: "le reçu", meaning: "the receipt" },
            { word: "l'argent liquide", meaning: "the cash" },
            { word: "la monnaie", meaning: "the change" },
            { word: "le sac", meaning: "the bag" },
          ],
          // Prices & Bargaining
          [
            { word: "la réduction", meaning: "the discount" },
            { word: "combien ça coûte?", meaning: "how much?" },
            { word: "le total", meaning: "the total" },
            { word: "payer", meaning: "to pay" },
            { word: "le coût", meaning: "the cost" },
            { word: "gratuit", meaning: "free" },
            { word: "le portefeuille", meaning: "the wallet" },
            { word: "la carte de crédit", meaning: "the credit card" },
          ],
          // Clothing Shopping
          [
            { word: "la taille", meaning: "the size" },
            { word: "essayer", meaning: "to try on" },
            { word: "aller bien", meaning: "to fit" },
            { word: "la chemise", meaning: "the shirt" },
            { word: "la robe", meaning: "the dress" },
            { word: "les chaussures", meaning: "the shoes" },
            { word: "le chapeau", meaning: "the hat" },
            { word: "la veste", meaning: "the jacket" },
          ],
          // Online Shopping
          [
            { word: "la commande", meaning: "the order" },
            { word: "la livraison", meaning: "the delivery" },
            { word: "le retour", meaning: "the return" },
            { word: "l'avis", meaning: "the review" },
            { word: "le panier", meaning: "the cart" },
            { word: "le paiement", meaning: "to checkout" },
            { word: "le colis", meaning: "the package" },
            { word: "l'adresse", meaning: "the address" },
          ],
          // Banking & Finance
          [
            { word: "la banque", meaning: "the bank" },
            { word: "le compte", meaning: "the account" },
            { word: "économiser", meaning: "to save" },
            { word: "dépenser", meaning: "to spend" },
            { word: "l'argent", meaning: "the money" },
            { word: "le prêt", meaning: "the loan" },
            { word: "la facture", meaning: "the bill" },
            { word: "le virement", meaning: "the transfer" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[7],
        description: "Entertainment in French",
        words: [
          // Music & Dance
          [
            { word: "la chanson", meaning: "the song" },
            { word: "le chanteur", meaning: "the singer" },
            { word: "la guitare", meaning: "the guitar" },
            { word: "le piano", meaning: "the piano" },
            { word: "le concert", meaning: "the concert" },
            { word: "la danse", meaning: "the dance" },
            { word: "le rythme", meaning: "the rhythm" },
            { word: "le groupe", meaning: "the band" },
          ],
          // Sports & Fitness
          [
            { word: "le football", meaning: "soccer" },
            { word: "le basketball", meaning: "basketball" },
            { word: "nager", meaning: "to swim" },
            { word: "courir", meaning: "to run" },
            { word: "la salle de sport", meaning: "the gym" },
            { word: "l'équipe", meaning: "the team" },
            { word: "le match", meaning: "the match" },
            { word: "l'exercice", meaning: "the exercise" },
          ],
          // Movies & TV
          [
            { word: "le film", meaning: "the movie" },
            { word: "l'acteur", meaning: "the actor" },
            { word: "l'histoire", meaning: "the story" },
            { word: "drôle", meaning: "funny" },
            { word: "effrayant", meaning: "scary" },
            { word: "la série", meaning: "the series" },
            { word: "le billet", meaning: "the ticket" },
            { word: "le spectacle", meaning: "the show" },
          ],
          // Games & Hobbies
          [
            { word: "le jeu", meaning: "the game" },
            { word: "jouer", meaning: "to play" },
            { word: "dessiner", meaning: "to draw" },
            { word: "peindre", meaning: "to paint" },
            { word: "lire", meaning: "to read" },
            { word: "le jardin", meaning: "the garden" },
            { word: "le puzzle", meaning: "the puzzle" },
            { word: "l'appareil photo", meaning: "the camera" },
          ],
          // Celebrations & Events
          [
            { word: "la fête", meaning: "the party" },
            { word: "l'anniversaire", meaning: "the birthday" },
            { word: "le cadeau", meaning: "the gift" },
            { word: "célébrer", meaning: "to celebrate" },
            { word: "le jour férié", meaning: "the holiday" },
            { word: "le mariage", meaning: "the wedding" },
            { word: "le festival", meaning: "the festival" },
            { word: "les feux d'artifice", meaning: "the fireworks" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[8],
        description: "Social life in French",
        words: [
          // Making Friends
          [
            { word: "l'ami", meaning: "the friend" },
            { word: "rencontrer", meaning: "to meet" },
            { word: "présenter", meaning: "to introduce" },
            { word: "gentil", meaning: "nice" },
            { word: "ensemble", meaning: "together" },
            { word: "le voisin", meaning: "the neighbor" },
            { word: "le groupe", meaning: "the group" },
            { word: "inviter", meaning: "to invite" },
          ],
          // Invitations & Plans
          [
            { word: "demain", meaning: "tomorrow" },
            { word: "ce soir", meaning: "tonight" },
            { word: "le week-end", meaning: "the weekend" },
            { word: "disponible", meaning: "available" },
            { word: "rejoindre", meaning: "to join" },
            { word: "la fête", meaning: "the party" },
            { word: "le dîner", meaning: "the dinner" },
            { word: "visiter", meaning: "to visit" },
          ],
          // Feelings & Moods
          [
            { word: "heureux", meaning: "happy" },
            { word: "triste", meaning: "sad" },
            { word: "en colère", meaning: "angry" },
            { word: "fatigué", meaning: "tired" },
            { word: "excité", meaning: "excited" },
            { word: "nerveux", meaning: "nervous" },
            { word: "surpris", meaning: "surprised" },
            { word: "calme", meaning: "calm" },
          ],
          // Communication
          [
            { word: "parler", meaning: "to talk" },
            { word: "écouter", meaning: "to listen" },
            { word: "le message", meaning: "the message" },
            { word: "appeler", meaning: "to call" },
            { word: "comprendre", meaning: "to understand" },
            { word: "être d'accord", meaning: "to agree" },
            { word: "ne pas être d'accord", meaning: "to disagree" },
            { word: "expliquer", meaning: "to explain" },
          ],
          // Relationships
          [
            { word: "l'amour", meaning: "love" },
            { word: "la famille", meaning: "the family" },
            { word: "la confiance", meaning: "trust" },
            { word: "le respect", meaning: "respect" },
            { word: "se marier", meaning: "to marry" },
            { word: "le partenaire", meaning: "the partner" },
            { word: "manquer", meaning: "to miss" },
            { word: "prendre soin", meaning: "to care" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[9],
        description: "Advanced phrases in French",
        words: [
          // Opinions & Beliefs
          [
            { word: "je pense", meaning: "I think" },
            { word: "je crois", meaning: "I believe" },
            { word: "à mon avis", meaning: "in my opinion" },
            { word: "d'accord", meaning: "agree" },
            { word: "pas d'accord", meaning: "disagree" },
            { word: "peut-être", meaning: "maybe" },
            { word: "certainement", meaning: "certainly" },
            { word: "probablement", meaning: "probably" },
          ],
          // Comparisons
          [
            { word: "meilleur", meaning: "better" },
            { word: "pire", meaning: "worse" },
            { word: "pareil", meaning: "same" },
            { word: "différent", meaning: "different" },
            { word: "plus", meaning: "more" },
            { word: "moins", meaning: "less" },
            { word: "similaire", meaning: "similar" },
            { word: "égal", meaning: "equal" },
          ],
          // Requests & Offers
          [
            { word: "pourriez-vous?", meaning: "could you?" },
            { word: "s'il vous plaît", meaning: "please" },
            { word: "ça vous dérangerait?", meaning: "would you mind?" },
            { word: "aider", meaning: "to help" },
            { word: "avoir besoin", meaning: "to need" },
            { word: "offrir", meaning: "to offer" },
            { word: "suggérer", meaning: "to suggest" },
            { word: "recommander", meaning: "to recommend" },
          ],
          // Cause & Effect
          [
            { word: "parce que", meaning: "because" },
            { word: "donc", meaning: "therefore" },
            { word: "pour que", meaning: "so that" },
            { word: "le résultat", meaning: "the result" },
            { word: "la raison", meaning: "the reason" },
            { word: "mener à", meaning: "to lead to" },
            { word: "en raison de", meaning: "due to" },
            { word: "la conséquence", meaning: "the consequence" },
          ],
          // Common Idioms
          [
            { word: "briser la glace", meaning: "break the ice" },
            { word: "c'est du gâteau", meaning: "piece of cake" },
            { word: "ne pas être dans son assiette", meaning: "under the weather" },
            { word: "prendre la route", meaning: "hit the road" },
            { word: "avoir du sens", meaning: "make sense" },
            { word: "prends-le cool", meaning: "take it easy" },
            { word: "ce n'est pas grave", meaning: "no big deal" },
            { word: "finissons-en", meaning: "call it a day" },
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
            { word: "お父さん (おとうさん)", meaning: "the father" },
            { word: "兄 (あに)", meaning: "the brother" },
            { word: "姉 (あね)", meaning: "the sister" },
          ],
          [
            { word: "一 (いち)", meaning: "one" },
            { word: "二 (に)", meaning: "two" },
            { word: "三 (さん)", meaning: "three" },
            { word: "四 (よん)", meaning: "four" },
            { word: "五 (ご)", meaning: "five" },
            { word: "六 (ろく)", meaning: "six" },
            { word: "七 (なな)", meaning: "seven" },
          ],
          [
            { word: "赤 (あか)", meaning: "red" },
            { word: "青 (あお)", meaning: "blue" },
            { word: "緑 (みどり)", meaning: "green" },
            { word: "黄色 (きいろ)", meaning: "yellow" },
            { word: "黒 (くろ)", meaning: "black" },
            { word: "白 (しろ)", meaning: "white" },
            { word: "紫 (むらさき)", meaning: "purple" },
          ],
          [
            { word: "本 (ほん)", meaning: "the book" },
            { word: "テーブル", meaning: "the table" },
            { word: "椅子 (いす)", meaning: "the chair" },
            { word: "電話 (でんわ)", meaning: "the phone" },
            { word: "鍵 (かぎ)", meaning: "the key" },
            { word: "時計 (とけい)", meaning: "the clock" },
            { word: "窓 (まど)", meaning: "the window" },
          ],
          [
            { word: "大きい (おおきい)", meaning: "big" },
            { word: "小さい (ちいさい)", meaning: "small" },
            { word: "良い (よい)", meaning: "good" },
            { word: "悪い (わるい)", meaning: "bad" },
            { word: "新しい (あたらしい)", meaning: "new" },
            { word: "古い (ふるい)", meaning: "old" },
            { word: "きれい", meaning: "pretty" },
            { word: "醜い (みにくい)", meaning: "ugly" },
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
            { word: "窓 (まど)", meaning: "the window" },
            { word: "庭 (にわ)", meaning: "the garden" },
          ],
          [
            { word: "食べる (たべる)", meaning: "to eat" },
            { word: "飲む (のむ)", meaning: "to drink" },
            { word: "寝る (ねる)", meaning: "to sleep" },
            { word: "走る (はしる)", meaning: "to run" },
            { word: "話す (はなす)", meaning: "to speak" },
            { word: "読む (よむ)", meaning: "to read" },
            { word: "書く (かく)", meaning: "to write" },
            { word: "歩く (あるく)", meaning: "to walk" },
          ],
          [
            { word: "月曜日 (げつようび)", meaning: "Monday" },
            { word: "火曜日 (かようび)", meaning: "Tuesday" },
            { word: "今日 (きょう)", meaning: "today" },
            { word: "明日 (あした)", meaning: "tomorrow" },
            { word: "時間 (じかん)", meaning: "the hour" },
            { word: "水曜日 (すいようび)", meaning: "Wednesday" },
            { word: "昨日 (きのう)", meaning: "yesterday" },
          ],
          [
            { word: "シャツ", meaning: "the shirt" },
            { word: "靴 (くつ)", meaning: "the shoes" },
            { word: "帽子 (ぼうし)", meaning: "the hat" },
            { word: "スカート", meaning: "the skirt" },
            { word: "コート", meaning: "the coat" },
            { word: "ズボン", meaning: "the pants" },
            { word: "ワンピース", meaning: "the dress" },
          ],
          [
            { word: "頭 (あたま)", meaning: "the head" },
            { word: "手 (て)", meaning: "the hand" },
            { word: "目 (め)", meaning: "the eye" },
            { word: "心 (こころ)", meaning: "the heart" },
            { word: "口 (くち)", meaning: "the mouth" },
            { word: "鼻 (はな)", meaning: "the nose" },
            { word: "腕 (うで)", meaning: "the arm" },
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
            { word: "いちご", meaning: "the strawberry" },
            { word: "玉ねぎ (たまねぎ)", meaning: "the onion" },
          ],
          [
            { word: "朝ごはん (あさごはん)", meaning: "breakfast" },
            { word: "昼ごはん (ひるごはん)", meaning: "lunch" },
            { word: "晩ごはん (ばんごはん)", meaning: "dinner" },
            { word: "ご飯 (ごはん)", meaning: "rice" },
            { word: "パン", meaning: "bread" },
            { word: "スープ", meaning: "the soup" },
            { word: "卵 (たまご)", meaning: "the egg" },
            { word: "塩 (しお)", meaning: "the salt" },
          ],
          [
            { word: "水 (みず)", meaning: "water" },
            { word: "牛乳 (ぎゅうにゅう)", meaning: "milk" },
            { word: "コーヒー", meaning: "coffee" },
            { word: "ジュース", meaning: "juice" },
            { word: "お茶 (おちゃ)", meaning: "tea" },
            { word: "ビール", meaning: "the beer" },
            { word: "ワイン", meaning: "the wine" },
          ],
          [
            { word: "メニュー", meaning: "the menu" },
            { word: "お会計 (おかいけい)", meaning: "the bill" },
            { word: "ウェイター", meaning: "the waiter" },
            { word: "チップ", meaning: "the tip" },
            { word: "お皿 (おさら)", meaning: "the plate" },
            { word: "フォーク", meaning: "the fork" },
            { word: "ナイフ", meaning: "the knife" },
          ],
          [
            { word: "甘い (あまい)", meaning: "sweet" },
            { word: "塩辛い (しおからい)", meaning: "salty" },
            { word: "辛い (からい)", meaning: "spicy" },
            { word: "美味しい (おいしい)", meaning: "delicious" },
            { word: "新鮮 (しんせん)", meaning: "fresh" },
            { word: "苦い (にがい)", meaning: "bitter" },
            { word: "熱い (あつい)", meaning: "hot" },
            { word: "冷たい (つめたい)", meaning: "cold" },
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
            { word: "自転車 (じてんしゃ)", meaning: "the bicycle" },
            { word: "タクシー", meaning: "the taxi" },
          ],
          [
            { word: "左 (ひだり)", meaning: "left" },
            { word: "右 (みぎ)", meaning: "right" },
            { word: "まっすぐ", meaning: "straight" },
            { word: "近い (ちかい)", meaning: "near" },
            { word: "遠い (とおい)", meaning: "far" },
            { word: "ここ", meaning: "here" },
            { word: "あそこ", meaning: "there" },
          ],
          [
            { word: "空港 (くうこう)", meaning: "the airport" },
            { word: "病院 (びょういん)", meaning: "the hospital" },
            { word: "学校 (がっこう)", meaning: "the school" },
            { word: "銀行 (ぎんこう)", meaning: "the bank" },
            { word: "店 (みせ)", meaning: "the shop" },
            { word: "教会 (きょうかい)", meaning: "the church" },
            { word: "美術館 (びじゅつかん)", meaning: "the museum" },
            { word: "図書館 (としょかん)", meaning: "the library" },
          ],
          [
            { word: "ホテル", meaning: "the hotel" },
            { word: "部屋 (へや)", meaning: "the room" },
            { word: "予約 (よやく)", meaning: "the reservation" },
            { word: "フロント", meaning: "the reception" },
            { word: "荷物 (にもつ)", meaning: "the luggage" },
            { word: "エレベーター", meaning: "the elevator" },
            { word: "プール", meaning: "the pool" },
          ],
          [
            { word: "太陽 (たいよう)", meaning: "the sun" },
            { word: "雨 (あめ)", meaning: "the rain" },
            { word: "風 (かぜ)", meaning: "the wind" },
            { word: "山 (やま)", meaning: "the mountain" },
            { word: "海 (うみ)", meaning: "the sea" },
            { word: "雲 (くも)", meaning: "the cloud" },
            { word: "雪 (ゆき)", meaning: "the snow" },
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
            { word: "こんばんは", meaning: "good evening" },
            { word: "また明日 (またあした)", meaning: "see you tomorrow" },
          ],
          [
            { word: "私の名前は (わたしのなまえは)", meaning: "my name is" },
            { word: "はじめまして", meaning: "nice to meet you" },
            { word: "お元気ですか (おげんきですか)", meaning: "how are you?" },
            { word: "出身は (しゅっしんは)", meaning: "I am from" },
            { word: "…歳です (…さいです)", meaning: "I am … years old" },
            { word: "あなたは？", meaning: "and you?" },
            { word: "…に住んでいます (…にすんでいます)", meaning: "I live in" },
          ],
          [
            { word: "お願いします (おねがいします)", meaning: "please" },
            { word: "ありがとう", meaning: "thank you" },
            { word: "どういたしまして", meaning: "you're welcome" },
            { word: "すみません", meaning: "I'm sorry" },
            { word: "分かりません (わかりません)", meaning: "I don't understand" },
            { word: "もちろん", meaning: "of course" },
            { word: "知りません (しりません)", meaning: "I don't know" },
            { word: "大丈夫 (だいじょうぶ)", meaning: "it's okay" },
          ],
          [
            { word: "嬉しい (うれしい)", meaning: "happy" },
            { word: "悲しい (かなしい)", meaning: "sad" },
            { word: "怒っている (おこっている)", meaning: "angry" },
            { word: "疲れた (つかれた)", meaning: "tired" },
            { word: "わくわくする", meaning: "excited" },
            { word: "緊張する (きんちょうする)", meaning: "nervous" },
            { word: "驚いた (おどろいた)", meaning: "surprised" },
          ],
          [
            { word: "失礼します (しつれいします)", meaning: "excuse me" },
            { word: "ごめんなさい", meaning: "pardon me" },
            { word: "乾杯 (かんぱい)", meaning: "bless you! / cheers!" },
            { word: "いただきます", meaning: "enjoy your meal" },
            { word: "頑張って (がんばって)", meaning: "good luck!" },
            { word: "喜んで (よろこんで)", meaning: "with pleasure" },
            { word: "こちらこそ", meaning: "likewise" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[5],
        description: "Work and study in Japanese",
        words: [
          // Professions
          [
            { word: "先生 (せんせい)", meaning: "the teacher" },
            { word: "医者 (いしゃ)", meaning: "the doctor" },
            { word: "エンジニア", meaning: "the engineer" },
            { word: "学生 (がくせい)", meaning: "the student" },
            { word: "弁護士 (べんごし)", meaning: "the lawyer" },
            { word: "看護師 (かんごし)", meaning: "the nurse" },
            { word: "シェフ", meaning: "the chef" },
            { word: "運転手 (うんてんしゅ)", meaning: "the driver" },
          ],
          // Office & School
          [
            { word: "パソコン", meaning: "the computer" },
            { word: "机 (つくえ)", meaning: "the desk" },
            { word: "教室 (きょうしつ)", meaning: "the classroom" },
            { word: "会議 (かいぎ)", meaning: "the meeting" },
            { word: "宿題 (しゅくだい)", meaning: "the homework" },
            { word: "プロジェクト", meaning: "the project" },
            { word: "メール", meaning: "the email" },
            { word: "鉛筆 (えんぴつ)", meaning: "the pencil" },
          ],
          // Technology
          [
            { word: "インターネット", meaning: "the internet" },
            { word: "パスワード", meaning: "the password" },
            { word: "ウェブサイト", meaning: "the website" },
            { word: "アプリ", meaning: "the phone app" },
            { word: "ダウンロード", meaning: "to download" },
            { word: "検索 (けんさく)", meaning: "to search" },
            { word: "バッテリー", meaning: "the battery" },
            { word: "画面 (がめん)", meaning: "the screen" },
          ],
          // Meetings & Classes
          [
            { word: "スケジュール", meaning: "the schedule" },
            { word: "プレゼン", meaning: "the presentation" },
            { word: "試験 (しけん)", meaning: "the exam" },
            { word: "成績 (せいせき)", meaning: "the grade" },
            { word: "レポート", meaning: "the report" },
            { word: "締め切り (しめきり)", meaning: "the deadline" },
            { word: "質問 (しつもん)", meaning: "the question" },
            { word: "答え (こたえ)", meaning: "the answer" },
          ],
          // Goals & Plans
          [
            { word: "夢 (ゆめ)", meaning: "the dream" },
            { word: "成功 (せいこう)", meaning: "the success" },
            { word: "努力 (どりょく)", meaning: "the effort" },
            { word: "進歩 (しんぽ)", meaning: "the progress" },
            { word: "未来 (みらい)", meaning: "the future" },
            { word: "キャリア", meaning: "the career" },
            { word: "目標 (もくひょう)", meaning: "the goal" },
            { word: "計画 (けいかく)", meaning: "the plan" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[6],
        description: "Shopping and money in Japanese",
        words: [
          // At the Store
          [
            { word: "値段 (ねだん)", meaning: "the price" },
            { word: "高い (たかい)", meaning: "expensive" },
            { word: "安い (やすい)", meaning: "cheap" },
            { word: "セール", meaning: "the sale" },
            { word: "レシート", meaning: "the receipt" },
            { word: "現金 (げんきん)", meaning: "the cash" },
            { word: "おつり", meaning: "the change" },
            { word: "袋 (ふくろ)", meaning: "the bag" },
          ],
          // Prices & Bargaining
          [
            { word: "割引 (わりびき)", meaning: "the discount" },
            { word: "いくらですか？", meaning: "how much?" },
            { word: "合計 (ごうけい)", meaning: "the total" },
            { word: "払う (はらう)", meaning: "to pay" },
            { word: "費用 (ひよう)", meaning: "the cost" },
            { word: "無料 (むりょう)", meaning: "free" },
            { word: "財布 (さいふ)", meaning: "the wallet" },
            { word: "クレジットカード", meaning: "the credit card" },
          ],
          // Clothing Shopping
          [
            { word: "サイズ", meaning: "the size" },
            { word: "試着する (しちゃくする)", meaning: "to try on" },
            { word: "合う (あう)", meaning: "to fit" },
            { word: "シャツ", meaning: "the shirt" },
            { word: "ワンピース", meaning: "the dress" },
            { word: "靴 (くつ)", meaning: "the shoes" },
            { word: "帽子 (ぼうし)", meaning: "the hat" },
            { word: "ジャケット", meaning: "the jacket" },
          ],
          // Online Shopping
          [
            { word: "注文 (ちゅうもん)", meaning: "the order" },
            { word: "配達 (はいたつ)", meaning: "the delivery" },
            { word: "返品 (へんぴん)", meaning: "the return" },
            { word: "レビュー", meaning: "the review" },
            { word: "カート", meaning: "the cart" },
            { word: "会計 (かいけい)", meaning: "to checkout" },
            { word: "荷物 (にもつ)", meaning: "the package" },
            { word: "住所 (じゅうしょ)", meaning: "the address" },
          ],
          // Banking & Finance
          [
            { word: "銀行 (ぎんこう)", meaning: "the bank" },
            { word: "口座 (こうざ)", meaning: "the account" },
            { word: "貯金する (ちょきんする)", meaning: "to save" },
            { word: "使う (つかう)", meaning: "to spend" },
            { word: "お金 (おかね)", meaning: "the money" },
            { word: "ローン", meaning: "the loan" },
            { word: "請求書 (せいきゅうしょ)", meaning: "the bill" },
            { word: "振込 (ふりこみ)", meaning: "the transfer" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[7],
        description: "Entertainment in Japanese",
        words: [
          // Music & Dance
          [
            { word: "歌 (うた)", meaning: "the song" },
            { word: "歌手 (かしゅ)", meaning: "the singer" },
            { word: "ギター", meaning: "the guitar" },
            { word: "ピアノ", meaning: "the piano" },
            { word: "コンサート", meaning: "the concert" },
            { word: "ダンス", meaning: "the dance" },
            { word: "リズム", meaning: "the rhythm" },
            { word: "バンド", meaning: "the band" },
          ],
          // Sports & Fitness
          [
            { word: "サッカー", meaning: "soccer" },
            { word: "バスケットボール", meaning: "basketball" },
            { word: "泳ぐ (およぐ)", meaning: "to swim" },
            { word: "走る (はしる)", meaning: "to run" },
            { word: "ジム", meaning: "the gym" },
            { word: "チーム", meaning: "the team" },
            { word: "試合 (しあい)", meaning: "the match" },
            { word: "運動 (うんどう)", meaning: "the exercise" },
          ],
          // Movies & TV
          [
            { word: "映画 (えいが)", meaning: "the movie" },
            { word: "俳優 (はいゆう)", meaning: "the actor" },
            { word: "物語 (ものがたり)", meaning: "the story" },
            { word: "面白い (おもしろい)", meaning: "funny" },
            { word: "怖い (こわい)", meaning: "scary" },
            { word: "ドラマ", meaning: "the series" },
            { word: "チケット", meaning: "the ticket" },
            { word: "ショー", meaning: "the show" },
          ],
          // Games & Hobbies
          [
            { word: "ゲーム", meaning: "the game" },
            { word: "遊ぶ (あそぶ)", meaning: "to play" },
            { word: "絵を描く (えをかく)", meaning: "to draw" },
            { word: "塗る (ぬる)", meaning: "to paint" },
            { word: "読む (よむ)", meaning: "to read" },
            { word: "庭 (にわ)", meaning: "the garden" },
            { word: "パズル", meaning: "the puzzle" },
            { word: "カメラ", meaning: "the camera" },
          ],
          // Celebrations & Events
          [
            { word: "パーティー", meaning: "the party" },
            { word: "誕生日 (たんじょうび)", meaning: "the birthday" },
            { word: "プレゼント", meaning: "the gift" },
            { word: "祝う (いわう)", meaning: "to celebrate" },
            { word: "祝日 (しゅくじつ)", meaning: "the holiday" },
            { word: "結婚式 (けっこんしき)", meaning: "the wedding" },
            { word: "フェスティバル", meaning: "the festival" },
            { word: "花火 (はなび)", meaning: "the fireworks" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[8],
        description: "Social life in Japanese",
        words: [
          // Making Friends
          [
            { word: "友達 (ともだち)", meaning: "the friend" },
            { word: "会う (あう)", meaning: "to meet" },
            { word: "紹介する (しょうかいする)", meaning: "to introduce" },
            { word: "優しい (やさしい)", meaning: "nice" },
            { word: "一緒に (いっしょに)", meaning: "together" },
            { word: "隣人 (りんじん)", meaning: "the neighbor" },
            { word: "グループ", meaning: "the group" },
            { word: "招待する (しょうたいする)", meaning: "to invite" },
          ],
          // Invitations & Plans
          [
            { word: "明日 (あした)", meaning: "tomorrow" },
            { word: "今夜 (こんや)", meaning: "tonight" },
            { word: "週末 (しゅうまつ)", meaning: "the weekend" },
            { word: "空いている (あいている)", meaning: "available" },
            { word: "参加する (さんかする)", meaning: "to join" },
            { word: "パーティー", meaning: "the party" },
            { word: "夕食 (ゆうしょく)", meaning: "the dinner" },
            { word: "訪問する (ほうもんする)", meaning: "to visit" },
          ],
          // Feelings & Moods
          [
            { word: "嬉しい (うれしい)", meaning: "happy" },
            { word: "悲しい (かなしい)", meaning: "sad" },
            { word: "怒っている (おこっている)", meaning: "angry" },
            { word: "疲れた (つかれた)", meaning: "tired" },
            { word: "わくわくする", meaning: "excited" },
            { word: "緊張する (きんちょうする)", meaning: "nervous" },
            { word: "驚いた (おどろいた)", meaning: "surprised" },
            { word: "穏やか (おだやか)", meaning: "calm" },
          ],
          // Communication
          [
            { word: "話す (はなす)", meaning: "to talk" },
            { word: "聞く (きく)", meaning: "to listen" },
            { word: "メッセージ", meaning: "the message" },
            { word: "電話する (でんわする)", meaning: "to call" },
            { word: "理解する (りかいする)", meaning: "to understand" },
            { word: "賛成する (さんせいする)", meaning: "to agree" },
            { word: "反対する (はんたいする)", meaning: "to disagree" },
            { word: "説明する (せつめいする)", meaning: "to explain" },
          ],
          // Relationships
          [
            { word: "愛 (あい)", meaning: "love" },
            { word: "家族 (かぞく)", meaning: "the family" },
            { word: "信頼 (しんらい)", meaning: "trust" },
            { word: "尊敬 (そんけい)", meaning: "respect" },
            { word: "結婚する (けっこんする)", meaning: "to marry" },
            { word: "パートナー", meaning: "the partner" },
            { word: "恋しい (こいしい)", meaning: "to miss" },
            { word: "気にかける (きにかける)", meaning: "to care" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[9],
        description: "Advanced phrases in Japanese",
        words: [
          // Opinions & Beliefs
          [
            { word: "思う (おもう)", meaning: "I think" },
            { word: "信じる (しんじる)", meaning: "I believe" },
            { word: "私の意見では (わたしのいけんでは)", meaning: "in my opinion" },
            { word: "賛成 (さんせい)", meaning: "agree" },
            { word: "反対 (はんたい)", meaning: "disagree" },
            { word: "たぶん", meaning: "maybe" },
            { word: "確かに (たしかに)", meaning: "certainly" },
            { word: "おそらく", meaning: "probably" },
          ],
          // Comparisons
          [
            { word: "より良い (よりよい)", meaning: "better" },
            { word: "より悪い (よりわるい)", meaning: "worse" },
            { word: "同じ (おなじ)", meaning: "same" },
            { word: "違う (ちがう)", meaning: "different" },
            { word: "もっと", meaning: "more" },
            { word: "より少ない (よりすくない)", meaning: "less" },
            { word: "似ている (にている)", meaning: "similar" },
            { word: "等しい (ひとしい)", meaning: "equal" },
          ],
          // Requests & Offers
          [
            { word: "していただけますか？", meaning: "could you?" },
            { word: "お願いします (おねがいします)", meaning: "please" },
            { word: "よろしいでしょうか？", meaning: "would you mind?" },
            { word: "助ける (たすける)", meaning: "to help" },
            { word: "必要 (ひつよう)", meaning: "to need" },
            { word: "提供する (ていきょうする)", meaning: "to offer" },
            { word: "提案する (ていあんする)", meaning: "to suggest" },
            { word: "おすすめする", meaning: "to recommend" },
          ],
          // Cause & Effect
          [
            { word: "なぜなら", meaning: "because" },
            { word: "したがって", meaning: "therefore" },
            { word: "そのために", meaning: "so that" },
            { word: "結果 (けっか)", meaning: "the result" },
            { word: "理由 (りゆう)", meaning: "the reason" },
            { word: "つながる", meaning: "to lead to" },
            { word: "のために", meaning: "due to" },
            { word: "結末 (けつまつ)", meaning: "the consequence" },
          ],
          // Common Idioms
          [
            { word: "打ち解ける (うちとける)", meaning: "break the ice" },
            { word: "朝飯前 (あさめしまえ)", meaning: "piece of cake" },
            { word: "体調が悪い (たいちょうがわるい)", meaning: "under the weather" },
            { word: "出発する (しゅっぱつする)", meaning: "hit the road" },
            { word: "意味がある (いみがある)", meaning: "make sense" },
            { word: "気楽にね (きらくにね)", meaning: "take it easy" },
            { word: "大したことない (たいしたことない)", meaning: "no big deal" },
            { word: "今日はここまで (きょうはここまで)", meaning: "call it a day" },
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
            { word: "father", meaning: "父亲" },
            { word: "brother", meaning: "兄弟" },
            { word: "sister", meaning: "姐妹" },
          ],
          [
            { word: "one", meaning: "一" },
            { word: "two", meaning: "二" },
            { word: "three", meaning: "三" },
            { word: "four", meaning: "四" },
            { word: "five", meaning: "五" },
            { word: "six", meaning: "六" },
            { word: "seven", meaning: "七" },
          ],
          [
            { word: "red", meaning: "红色" },
            { word: "blue", meaning: "蓝色" },
            { word: "green", meaning: "绿色" },
            { word: "yellow", meaning: "黄色" },
            { word: "black", meaning: "黑色" },
            { word: "white", meaning: "白色" },
            { word: "purple", meaning: "紫色" },
          ],
          [
            { word: "book", meaning: "书" },
            { word: "table", meaning: "桌子" },
            { word: "chair", meaning: "椅子" },
            { word: "phone", meaning: "电话" },
            { word: "key", meaning: "钥匙" },
            { word: "clock", meaning: "时钟" },
            { word: "window", meaning: "窗户" },
          ],
          [
            { word: "big", meaning: "大" },
            { word: "small", meaning: "小" },
            { word: "good", meaning: "好" },
            { word: "bad", meaning: "坏" },
            { word: "new", meaning: "新" },
            { word: "old", meaning: "旧" },
            { word: "pretty", meaning: "漂亮" },
            { word: "ugly", meaning: "丑" },
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
            { word: "window", meaning: "窗户" },
            { word: "garden", meaning: "花园" },
          ],
          [
            { word: "eat", meaning: "吃" },
            { word: "drink", meaning: "喝" },
            { word: "sleep", meaning: "睡觉" },
            { word: "run", meaning: "跑" },
            { word: "speak", meaning: "说" },
            { word: "read", meaning: "读" },
            { word: "write", meaning: "写" },
            { word: "walk", meaning: "走路" },
          ],
          [
            { word: "Monday", meaning: "星期一" },
            { word: "Tuesday", meaning: "星期二" },
            { word: "today", meaning: "今天" },
            { word: "tomorrow", meaning: "明天" },
            { word: "hour", meaning: "小时" },
            { word: "Wednesday", meaning: "星期三" },
            { word: "yesterday", meaning: "昨天" },
          ],
          [
            { word: "shirt", meaning: "衬衫" },
            { word: "shoes", meaning: "鞋子" },
            { word: "hat", meaning: "帽子" },
            { word: "skirt", meaning: "裙子" },
            { word: "coat", meaning: "外套" },
            { word: "pants", meaning: "裤子" },
            { word: "dress", meaning: "连衣裙" },
          ],
          [
            { word: "head", meaning: "头" },
            { word: "hand", meaning: "手" },
            { word: "eye", meaning: "眼睛" },
            { word: "heart", meaning: "心脏" },
            { word: "mouth", meaning: "嘴" },
            { word: "nose", meaning: "鼻子" },
            { word: "arm", meaning: "手臂" },
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
            { word: "strawberry", meaning: "草莓" },
            { word: "onion", meaning: "洋葱" },
          ],
          [
            { word: "breakfast", meaning: "早餐" },
            { word: "lunch", meaning: "午餐" },
            { word: "dinner", meaning: "晚餐" },
            { word: "rice", meaning: "米饭" },
            { word: "bread", meaning: "面包" },
            { word: "soup", meaning: "汤" },
            { word: "egg", meaning: "鸡蛋" },
            { word: "salt", meaning: "盐" },
          ],
          [
            { word: "water", meaning: "水" },
            { word: "milk", meaning: "牛奶" },
            { word: "coffee", meaning: "咖啡" },
            { word: "juice", meaning: "果汁" },
            { word: "tea", meaning: "茶" },
            { word: "beer", meaning: "啤酒" },
            { word: "wine", meaning: "葡萄酒" },
          ],
          [
            { word: "menu", meaning: "菜单" },
            { word: "bill", meaning: "账单" },
            { word: "waiter", meaning: "服务员" },
            { word: "tip", meaning: "小费" },
            { word: "plate", meaning: "盘子" },
            { word: "fork", meaning: "叉子" },
            { word: "knife", meaning: "刀" },
          ],
          [
            { word: "sweet", meaning: "甜的" },
            { word: "salty", meaning: "咸的" },
            { word: "spicy", meaning: "辣的" },
            { word: "delicious", meaning: "美味的" },
            { word: "fresh", meaning: "新鲜的" },
            { word: "bitter", meaning: "苦的" },
            { word: "hot", meaning: "热的" },
            { word: "cold", meaning: "冷的" },
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
            { word: "bicycle", meaning: "自行车" },
            { word: "taxi", meaning: "出租车" },
          ],
          [
            { word: "left", meaning: "左" },
            { word: "right", meaning: "右" },
            { word: "straight", meaning: "直行" },
            { word: "near", meaning: "近" },
            { word: "far", meaning: "远" },
            { word: "here", meaning: "这里" },
            { word: "there", meaning: "那里" },
          ],
          [
            { word: "airport", meaning: "机场" },
            { word: "hospital", meaning: "医院" },
            { word: "school", meaning: "学校" },
            { word: "bank", meaning: "银行" },
            { word: "shop", meaning: "商店" },
            { word: "church", meaning: "教堂" },
            { word: "museum", meaning: "博物馆" },
            { word: "library", meaning: "图书馆" },
          ],
          [
            { word: "hotel", meaning: "酒店" },
            { word: "room", meaning: "房间" },
            { word: "reservation", meaning: "预订" },
            { word: "reception", meaning: "前台" },
            { word: "luggage", meaning: "行李" },
            { word: "elevator", meaning: "电梯" },
            { word: "pool", meaning: "游泳池" },
          ],
          [
            { word: "sun", meaning: "太阳" },
            { word: "rain", meaning: "雨" },
            { word: "wind", meaning: "风" },
            { word: "mountain", meaning: "山" },
            { word: "sea", meaning: "海" },
            { word: "cloud", meaning: "云" },
            { word: "snow", meaning: "雪" },
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
            { word: "good afternoon", meaning: "下午好" },
            { word: "see you tomorrow", meaning: "明天见" },
          ],
          [
            { word: "my name is", meaning: "我叫" },
            { word: "nice to meet you", meaning: "很高兴认识你" },
            { word: "how are you?", meaning: "你好吗？" },
            { word: "I am from", meaning: "我来自" },
            { word: "I am … years old", meaning: "我…岁了" },
            { word: "and you?", meaning: "你呢？" },
            { word: "I live in", meaning: "我住在" },
          ],
          [
            { word: "please", meaning: "请" },
            { word: "thank you", meaning: "谢谢" },
            { word: "you're welcome", meaning: "不客气" },
            { word: "I'm sorry", meaning: "对不起" },
            { word: "I don't understand", meaning: "我不明白" },
            { word: "of course", meaning: "当然" },
            { word: "I don't know", meaning: "我不知道" },
            { word: "it's okay", meaning: "没关系" },
          ],
          [
            { word: "happy", meaning: "高兴" },
            { word: "sad", meaning: "伤心" },
            { word: "angry", meaning: "生气" },
            { word: "tired", meaning: "累" },
            { word: "excited", meaning: "兴奋" },
            { word: "nervous", meaning: "紧张" },
            { word: "surprised", meaning: "惊讶" },
          ],
          [
            { word: "excuse me", meaning: "打扰一下" },
            { word: "pardon me", meaning: "对不起" },
            { word: "cheers!", meaning: "干杯！" },
            { word: "enjoy your meal", meaning: "请慢用" },
            { word: "good luck!", meaning: "祝你好运！" },
            { word: "with pleasure", meaning: "乐意效劳" },
            { word: "likewise", meaning: "彼此彼此" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[5],
        description: "Work and study in English",
        words: [
          // Professions
          [
            { word: "teacher", meaning: "老师" },
            { word: "doctor", meaning: "医生" },
            { word: "engineer", meaning: "工程师" },
            { word: "student", meaning: "学生" },
            { word: "lawyer", meaning: "律师" },
            { word: "nurse", meaning: "护士" },
            { word: "chef", meaning: "厨师" },
            { word: "driver", meaning: "司机" },
          ],
          // Office & School
          [
            { word: "computer", meaning: "电脑" },
            { word: "desk", meaning: "书桌" },
            { word: "classroom", meaning: "教室" },
            { word: "meeting", meaning: "会议" },
            { word: "homework", meaning: "作业" },
            { word: "project", meaning: "项目" },
            { word: "email", meaning: "电子邮件" },
            { word: "pencil", meaning: "铅笔" },
          ],
          // Technology
          [
            { word: "internet", meaning: "互联网" },
            { word: "password", meaning: "密码" },
            { word: "website", meaning: "网站" },
            { word: "phone app", meaning: "手机应用" },
            { word: "download", meaning: "下载" },
            { word: "search", meaning: "搜索" },
            { word: "battery", meaning: "电池" },
            { word: "screen", meaning: "屏幕" },
          ],
          // Meetings & Classes
          [
            { word: "schedule", meaning: "日程" },
            { word: "presentation", meaning: "演示" },
            { word: "exam", meaning: "考试" },
            { word: "grade", meaning: "成绩" },
            { word: "report", meaning: "报告" },
            { word: "deadline", meaning: "截止日期" },
            { word: "question", meaning: "问题" },
            { word: "answer", meaning: "答案" },
          ],
          // Goals & Plans
          [
            { word: "dream", meaning: "梦想" },
            { word: "success", meaning: "成功" },
            { word: "effort", meaning: "努力" },
            { word: "progress", meaning: "进步" },
            { word: "future", meaning: "未来" },
            { word: "career", meaning: "事业" },
            { word: "goal", meaning: "目标" },
            { word: "plan", meaning: "计划" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[6],
        description: "Shopping and money in English",
        words: [
          // At the Store
          [
            { word: "price", meaning: "价格" },
            { word: "expensive", meaning: "贵的" },
            { word: "cheap", meaning: "便宜的" },
            { word: "sale", meaning: "打折" },
            { word: "receipt", meaning: "收据" },
            { word: "cash", meaning: "现金" },
            { word: "change", meaning: "找零" },
            { word: "bag", meaning: "袋子" },
          ],
          // Prices & Bargaining
          [
            { word: "discount", meaning: "折扣" },
            { word: "how much?", meaning: "多少钱？" },
            { word: "total", meaning: "总计" },
            { word: "pay", meaning: "支付" },
            { word: "cost", meaning: "费用" },
            { word: "free", meaning: "免费" },
            { word: "wallet", meaning: "钱包" },
            { word: "credit card", meaning: "信用卡" },
          ],
          // Clothing Shopping
          [
            { word: "size", meaning: "尺码" },
            { word: "try on", meaning: "试穿" },
            { word: "fit", meaning: "合身" },
            { word: "shirt", meaning: "衬衫" },
            { word: "dress", meaning: "连衣裙" },
            { word: "shoes", meaning: "鞋子" },
            { word: "hat", meaning: "帽子" },
            { word: "jacket", meaning: "夹克" },
          ],
          // Online Shopping
          [
            { word: "order", meaning: "订单" },
            { word: "delivery", meaning: "配送" },
            { word: "return", meaning: "退货" },
            { word: "review", meaning: "评价" },
            { word: "cart", meaning: "购物车" },
            { word: "checkout", meaning: "结账" },
            { word: "package", meaning: "包裹" },
            { word: "address", meaning: "地址" },
          ],
          // Banking & Finance
          [
            { word: "bank", meaning: "银行" },
            { word: "account", meaning: "账户" },
            { word: "save", meaning: "存钱" },
            { word: "spend", meaning: "花钱" },
            { word: "money", meaning: "钱" },
            { word: "loan", meaning: "贷款" },
            { word: "bill", meaning: "账单" },
            { word: "transfer", meaning: "转账" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[7],
        description: "Entertainment in English",
        words: [
          // Music & Dance
          [
            { word: "song", meaning: "歌曲" },
            { word: "singer", meaning: "歌手" },
            { word: "guitar", meaning: "吉他" },
            { word: "piano", meaning: "钢琴" },
            { word: "concert", meaning: "音乐会" },
            { word: "dance", meaning: "舞蹈" },
            { word: "rhythm", meaning: "节奏" },
            { word: "band", meaning: "乐队" },
          ],
          // Sports & Fitness
          [
            { word: "soccer", meaning: "足球" },
            { word: "basketball", meaning: "篮球" },
            { word: "swim", meaning: "游泳" },
            { word: "run", meaning: "跑步" },
            { word: "gym", meaning: "健身房" },
            { word: "team", meaning: "队伍" },
            { word: "match", meaning: "比赛" },
            { word: "exercise", meaning: "锻炼" },
          ],
          // Movies & TV
          [
            { word: "movie", meaning: "电影" },
            { word: "actor", meaning: "演员" },
            { word: "story", meaning: "故事" },
            { word: "funny", meaning: "搞笑的" },
            { word: "scary", meaning: "恐怖的" },
            { word: "series", meaning: "连续剧" },
            { word: "ticket", meaning: "票" },
            { word: "show", meaning: "节目" },
          ],
          // Games & Hobbies
          [
            { word: "game", meaning: "游戏" },
            { word: "play", meaning: "玩" },
            { word: "draw", meaning: "画画" },
            { word: "paint", meaning: "绘画" },
            { word: "read", meaning: "阅读" },
            { word: "garden", meaning: "园艺" },
            { word: "puzzle", meaning: "拼图" },
            { word: "camera", meaning: "相机" },
          ],
          // Celebrations & Events
          [
            { word: "party", meaning: "派对" },
            { word: "birthday", meaning: "生日" },
            { word: "gift", meaning: "礼物" },
            { word: "celebrate", meaning: "庆祝" },
            { word: "holiday", meaning: "假日" },
            { word: "wedding", meaning: "婚礼" },
            { word: "festival", meaning: "节日" },
            { word: "fireworks", meaning: "烟花" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[8],
        description: "Social life in English",
        words: [
          // Making Friends
          [
            { word: "friend", meaning: "朋友" },
            { word: "meet", meaning: "见面" },
            { word: "introduce", meaning: "介绍" },
            { word: "nice", meaning: "友善的" },
            { word: "together", meaning: "一起" },
            { word: "neighbor", meaning: "邻居" },
            { word: "group", meaning: "群组" },
            { word: "invite", meaning: "邀请" },
          ],
          // Invitations & Plans
          [
            { word: "tomorrow", meaning: "明天" },
            { word: "tonight", meaning: "今晚" },
            { word: "weekend", meaning: "周末" },
            { word: "available", meaning: "有空的" },
            { word: "join", meaning: "加入" },
            { word: "party", meaning: "聚会" },
            { word: "dinner", meaning: "晚餐" },
            { word: "visit", meaning: "拜访" },
          ],
          // Feelings & Moods
          [
            { word: "happy", meaning: "开心" },
            { word: "sad", meaning: "难过" },
            { word: "angry", meaning: "生气" },
            { word: "tired", meaning: "疲劳" },
            { word: "excited", meaning: "兴奋" },
            { word: "nervous", meaning: "紧张" },
            { word: "surprised", meaning: "吃惊" },
            { word: "calm", meaning: "平静" },
          ],
          // Communication
          [
            { word: "talk", meaning: "交谈" },
            { word: "listen", meaning: "听" },
            { word: "message", meaning: "消息" },
            { word: "call", meaning: "打电话" },
            { word: "understand", meaning: "理解" },
            { word: "agree", meaning: "同意" },
            { word: "disagree", meaning: "不同意" },
            { word: "explain", meaning: "解释" },
          ],
          // Relationships
          [
            { word: "love", meaning: "爱" },
            { word: "family", meaning: "家人" },
            { word: "trust", meaning: "信任" },
            { word: "respect", meaning: "尊重" },
            { word: "marry", meaning: "结婚" },
            { word: "partner", meaning: "伴侣" },
            { word: "miss", meaning: "想念" },
            { word: "care", meaning: "关心" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[9],
        description: "Advanced phrases in English",
        words: [
          // Opinions & Beliefs
          [
            { word: "I think", meaning: "我认为" },
            { word: "I believe", meaning: "我相信" },
            { word: "in my opinion", meaning: "在我看来" },
            { word: "agree", meaning: "同意" },
            { word: "disagree", meaning: "不同意" },
            { word: "maybe", meaning: "也许" },
            { word: "certainly", meaning: "当然" },
            { word: "probably", meaning: "可能" },
          ],
          // Comparisons
          [
            { word: "better", meaning: "更好" },
            { word: "worse", meaning: "更差" },
            { word: "same", meaning: "相同" },
            { word: "different", meaning: "不同" },
            { word: "more", meaning: "更多" },
            { word: "less", meaning: "更少" },
            { word: "similar", meaning: "相似" },
            { word: "equal", meaning: "相等" },
          ],
          // Requests & Offers
          [
            { word: "could you?", meaning: "你能…吗？" },
            { word: "please", meaning: "请" },
            { word: "would you mind?", meaning: "你介意…吗？" },
            { word: "help", meaning: "帮助" },
            { word: "need", meaning: "需要" },
            { word: "offer", meaning: "提供" },
            { word: "suggest", meaning: "建议" },
            { word: "recommend", meaning: "推荐" },
          ],
          // Cause & Effect
          [
            { word: "because", meaning: "因为" },
            { word: "therefore", meaning: "因此" },
            { word: "so that", meaning: "以便" },
            { word: "result", meaning: "结果" },
            { word: "reason", meaning: "原因" },
            { word: "lead to", meaning: "导致" },
            { word: "due to", meaning: "由于" },
            { word: "consequence", meaning: "后果" },
          ],
          // Common Idioms
          [
            { word: "break the ice", meaning: "打破僵局" },
            { word: "piece of cake", meaning: "小菜一碟" },
            { word: "under the weather", meaning: "身体不舒服" },
            { word: "hit the road", meaning: "出发上路" },
            { word: "make sense", meaning: "有道理" },
            { word: "take it easy", meaning: "放轻松" },
            { word: "no big deal", meaning: "没什么大不了" },
            { word: "call it a day", meaning: "收工" },
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
            { word: "爸爸 (bàba)", meaning: "the father" },
            { word: "哥哥 (gēge)", meaning: "the brother" },
            { word: "姐姐 (jiějie)", meaning: "the sister" },
          ],
          [
            { word: "一 (yī)", meaning: "one" },
            { word: "二 (èr)", meaning: "two" },
            { word: "三 (sān)", meaning: "three" },
            { word: "四 (sì)", meaning: "four" },
            { word: "五 (wǔ)", meaning: "five" },
            { word: "六 (liù)", meaning: "six" },
            { word: "七 (qī)", meaning: "seven" },
          ],
          [
            { word: "红色 (hóngsè)", meaning: "red" },
            { word: "蓝色 (lánsè)", meaning: "blue" },
            { word: "绿色 (lǜsè)", meaning: "green" },
            { word: "黄色 (huángsè)", meaning: "yellow" },
            { word: "黑色 (hēisè)", meaning: "black" },
            { word: "白色 (báisè)", meaning: "white" },
            { word: "紫色 (zǐsè)", meaning: "purple" },
          ],
          [
            { word: "书 (shū)", meaning: "the book" },
            { word: "桌子 (zhuōzi)", meaning: "the table" },
            { word: "椅子 (yǐzi)", meaning: "the chair" },
            { word: "电话 (diànhuà)", meaning: "the phone" },
            { word: "钥匙 (yàoshi)", meaning: "the key" },
            { word: "时钟 (shízhōng)", meaning: "the clock" },
            { word: "窗户 (chuānghù)", meaning: "the window" },
          ],
          [
            { word: "大 (dà)", meaning: "big" },
            { word: "小 (xiǎo)", meaning: "small" },
            { word: "好 (hǎo)", meaning: "good" },
            { word: "坏 (huài)", meaning: "bad" },
            { word: "新 (xīn)", meaning: "new" },
            { word: "旧 (jiù)", meaning: "old" },
            { word: "漂亮 (piàoliang)", meaning: "pretty" },
            { word: "丑 (chǒu)", meaning: "ugly" },
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
            { word: "窗户 (chuānghù)", meaning: "the window" },
            { word: "花园 (huāyuán)", meaning: "the garden" },
          ],
          [
            { word: "吃 (chī)", meaning: "to eat" },
            { word: "喝 (hē)", meaning: "to drink" },
            { word: "睡觉 (shuìjiào)", meaning: "to sleep" },
            { word: "跑 (pǎo)", meaning: "to run" },
            { word: "说 (shuō)", meaning: "to speak" },
            { word: "读 (dú)", meaning: "to read" },
            { word: "写 (xiě)", meaning: "to write" },
            { word: "走路 (zǒulù)", meaning: "to walk" },
          ],
          [
            { word: "星期一 (xīngqīyī)", meaning: "Monday" },
            { word: "星期二 (xīngqīèr)", meaning: "Tuesday" },
            { word: "今天 (jīntiān)", meaning: "today" },
            { word: "明天 (míngtiān)", meaning: "tomorrow" },
            { word: "小时 (xiǎoshí)", meaning: "the hour" },
            { word: "星期三 (xīngqīsān)", meaning: "Wednesday" },
            { word: "昨天 (zuótiān)", meaning: "yesterday" },
          ],
          [
            { word: "衬衫 (chènshān)", meaning: "the shirt" },
            { word: "鞋子 (xiézi)", meaning: "the shoes" },
            { word: "帽子 (màozi)", meaning: "the hat" },
            { word: "裙子 (qúnzi)", meaning: "the skirt" },
            { word: "外套 (wàitào)", meaning: "the coat" },
            { word: "裤子 (kùzi)", meaning: "the pants" },
            { word: "连衣裙 (liányīqún)", meaning: "the dress" },
          ],
          [
            { word: "头 (tóu)", meaning: "the head" },
            { word: "手 (shǒu)", meaning: "the hand" },
            { word: "眼睛 (yǎnjing)", meaning: "the eye" },
            { word: "心脏 (xīnzàng)", meaning: "the heart" },
            { word: "嘴 (zuǐ)", meaning: "the mouth" },
            { word: "鼻子 (bízi)", meaning: "the nose" },
            { word: "手臂 (shǒubì)", meaning: "the arm" },
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
            { word: "草莓 (cǎoméi)", meaning: "the strawberry" },
            { word: "洋葱 (yángcōng)", meaning: "the onion" },
          ],
          [
            { word: "早餐 (zǎocān)", meaning: "breakfast" },
            { word: "午餐 (wǔcān)", meaning: "lunch" },
            { word: "晚餐 (wǎncān)", meaning: "dinner" },
            { word: "米饭 (mǐfàn)", meaning: "rice" },
            { word: "面包 (miànbāo)", meaning: "bread" },
            { word: "汤 (tāng)", meaning: "the soup" },
            { word: "鸡蛋 (jīdàn)", meaning: "the egg" },
            { word: "盐 (yán)", meaning: "the salt" },
          ],
          [
            { word: "水 (shuǐ)", meaning: "water" },
            { word: "牛奶 (niúnǎi)", meaning: "milk" },
            { word: "咖啡 (kāfēi)", meaning: "coffee" },
            { word: "果汁 (guǒzhī)", meaning: "juice" },
            { word: "茶 (chá)", meaning: "tea" },
            { word: "啤酒 (píjiǔ)", meaning: "the beer" },
            { word: "葡萄酒 (pútaojiǔ)", meaning: "the wine" },
          ],
          [
            { word: "菜单 (càidān)", meaning: "the menu" },
            { word: "账单 (zhàngdān)", meaning: "the bill" },
            { word: "服务员 (fúwùyuán)", meaning: "the waiter" },
            { word: "小费 (xiǎofèi)", meaning: "the tip" },
            { word: "盘子 (pánzi)", meaning: "the plate" },
            { word: "叉子 (chāzi)", meaning: "the fork" },
            { word: "刀 (dāo)", meaning: "the knife" },
          ],
          [
            { word: "甜 (tián)", meaning: "sweet" },
            { word: "咸 (xián)", meaning: "salty" },
            { word: "辣 (là)", meaning: "spicy" },
            { word: "美味 (měiwèi)", meaning: "delicious" },
            { word: "新鲜 (xīnxiān)", meaning: "fresh" },
            { word: "苦 (kǔ)", meaning: "bitter" },
            { word: "热 (rè)", meaning: "hot" },
            { word: "冷 (lěng)", meaning: "cold" },
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
            { word: "自行车 (zìxíngchē)", meaning: "the bicycle" },
            { word: "出租车 (chūzūchē)", meaning: "the taxi" },
          ],
          [
            { word: "左 (zuǒ)", meaning: "left" },
            { word: "右 (yòu)", meaning: "right" },
            { word: "直走 (zhí zǒu)", meaning: "straight" },
            { word: "近 (jìn)", meaning: "near" },
            { word: "远 (yuǎn)", meaning: "far" },
            { word: "这里 (zhèlǐ)", meaning: "here" },
            { word: "那里 (nàlǐ)", meaning: "there" },
          ],
          [
            { word: "机场 (jīchǎng)", meaning: "the airport" },
            { word: "医院 (yīyuàn)", meaning: "the hospital" },
            { word: "学校 (xuéxiào)", meaning: "the school" },
            { word: "银行 (yínháng)", meaning: "the bank" },
            { word: "商店 (shāngdiàn)", meaning: "the shop" },
            { word: "教堂 (jiàotáng)", meaning: "the church" },
            { word: "博物馆 (bówùguǎn)", meaning: "the museum" },
            { word: "图书馆 (túshūguǎn)", meaning: "the library" },
          ],
          [
            { word: "酒店 (jiǔdiàn)", meaning: "the hotel" },
            { word: "房间 (fángjiān)", meaning: "the room" },
            { word: "预订 (yùdìng)", meaning: "the reservation" },
            { word: "前台 (qiántái)", meaning: "the reception" },
            { word: "行李 (xíngli)", meaning: "the luggage" },
            { word: "电梯 (diàntī)", meaning: "the elevator" },
            { word: "游泳池 (yóuyǒngchí)", meaning: "the pool" },
          ],
          [
            { word: "太阳 (tàiyáng)", meaning: "the sun" },
            { word: "雨 (yǔ)", meaning: "the rain" },
            { word: "风 (fēng)", meaning: "the wind" },
            { word: "山 (shān)", meaning: "the mountain" },
            { word: "海 (hǎi)", meaning: "the sea" },
            { word: "云 (yún)", meaning: "the cloud" },
            { word: "雪 (xuě)", meaning: "the snow" },
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
            { word: "下午好 (xiàwǔ hǎo)", meaning: "good afternoon" },
            { word: "明天见 (míngtiān jiàn)", meaning: "see you tomorrow" },
          ],
          [
            { word: "我叫 (wǒ jiào)", meaning: "my name is" },
            { word: "很高兴认识你 (hěn gāoxìng rènshi nǐ)", meaning: "nice to meet you" },
            { word: "你好吗？(nǐ hǎo ma?)", meaning: "how are you?" },
            { word: "我来自 (wǒ lái zì)", meaning: "I am from" },
            { word: "我…岁 (wǒ … suì)", meaning: "I am … years old" },
            { word: "你呢？(nǐ ne?)", meaning: "and you?" },
            { word: "我住在 (wǒ zhù zài)", meaning: "I live in" },
          ],
          [
            { word: "请 (qǐng)", meaning: "please" },
            { word: "谢谢 (xièxie)", meaning: "thank you" },
            { word: "不客气 (bú kèqi)", meaning: "you're welcome" },
            { word: "对不起 (duìbuqǐ)", meaning: "I'm sorry" },
            { word: "我不明白 (wǒ bù míngbai)", meaning: "I don't understand" },
            { word: "当然 (dāngrán)", meaning: "of course" },
            { word: "我不知道 (wǒ bù zhīdào)", meaning: "I don't know" },
            { word: "没关系 (méi guānxi)", meaning: "it's okay" },
          ],
          [
            { word: "高兴 (gāoxìng)", meaning: "happy" },
            { word: "伤心 (shāngxīn)", meaning: "sad" },
            { word: "生气 (shēngqì)", meaning: "angry" },
            { word: "累 (lèi)", meaning: "tired" },
            { word: "兴奋 (xīngfèn)", meaning: "excited" },
            { word: "紧张 (jǐnzhāng)", meaning: "nervous" },
            { word: "惊讶 (jīngyà)", meaning: "surprised" },
          ],
          [
            { word: "打扰一下 (dǎrǎo yīxià)", meaning: "excuse me" },
            { word: "不好意思 (bù hǎoyìsi)", meaning: "pardon me" },
            { word: "干杯 (gānbēi)", meaning: "bless you! / cheers!" },
            { word: "请慢用 (qǐng màn yòng)", meaning: "enjoy your meal" },
            { word: "祝你好运 (zhù nǐ hǎo yùn)", meaning: "good luck!" },
            { word: "乐意效劳 (lèyì xiàoláo)", meaning: "with pleasure" },
            { word: "彼此彼此 (bǐcǐ bǐcǐ)", meaning: "likewise" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[5],
        description: "Work and study in Chinese",
        words: [
          // Professions
          [
            { word: "老师 (lǎoshī)", meaning: "the teacher" },
            { word: "医生 (yīshēng)", meaning: "the doctor" },
            { word: "工程师 (gōngchéngshī)", meaning: "the engineer" },
            { word: "学生 (xuéshēng)", meaning: "the student" },
            { word: "律师 (lǜshī)", meaning: "the lawyer" },
            { word: "护士 (hùshi)", meaning: "the nurse" },
            { word: "厨师 (chúshī)", meaning: "the chef" },
            { word: "司机 (sījī)", meaning: "the driver" },
          ],
          // Office & School
          [
            { word: "电脑 (diànnǎo)", meaning: "the computer" },
            { word: "书桌 (shūzhuō)", meaning: "the desk" },
            { word: "教室 (jiàoshì)", meaning: "the classroom" },
            { word: "会议 (huìyì)", meaning: "the meeting" },
            { word: "作业 (zuòyè)", meaning: "the homework" },
            { word: "项目 (xiàngmù)", meaning: "the project" },
            { word: "电子邮件 (diànzǐ yóujiàn)", meaning: "the email" },
            { word: "铅笔 (qiānbǐ)", meaning: "the pencil" },
          ],
          // Technology
          [
            { word: "互联网 (hùliánwǎng)", meaning: "the internet" },
            { word: "密码 (mìmǎ)", meaning: "the password" },
            { word: "网站 (wǎngzhàn)", meaning: "the website" },
            { word: "手机应用 (shǒujī yìngyòng)", meaning: "the phone app" },
            { word: "下载 (xiàzài)", meaning: "to download" },
            { word: "搜索 (sōusuǒ)", meaning: "to search" },
            { word: "电池 (diànchí)", meaning: "the battery" },
            { word: "屏幕 (píngmù)", meaning: "the screen" },
          ],
          // Meetings & Classes
          [
            { word: "日程 (rìchéng)", meaning: "the schedule" },
            { word: "演示 (yǎnshì)", meaning: "the presentation" },
            { word: "考试 (kǎoshì)", meaning: "the exam" },
            { word: "成绩 (chéngjì)", meaning: "the grade" },
            { word: "报告 (bàogào)", meaning: "the report" },
            { word: "截止日期 (jiézhǐ rìqī)", meaning: "the deadline" },
            { word: "问题 (wèntí)", meaning: "the question" },
            { word: "答案 (dá'àn)", meaning: "the answer" },
          ],
          // Goals & Plans
          [
            { word: "梦想 (mèngxiǎng)", meaning: "the dream" },
            { word: "成功 (chénggōng)", meaning: "the success" },
            { word: "努力 (nǔlì)", meaning: "the effort" },
            { word: "进步 (jìnbù)", meaning: "the progress" },
            { word: "未来 (wèilái)", meaning: "the future" },
            { word: "事业 (shìyè)", meaning: "the career" },
            { word: "目标 (mùbiāo)", meaning: "the goal" },
            { word: "计划 (jìhuà)", meaning: "the plan" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[6],
        description: "Shopping and money in Chinese",
        words: [
          // At the Store
          [
            { word: "价格 (jiàgé)", meaning: "the price" },
            { word: "贵 (guì)", meaning: "expensive" },
            { word: "便宜 (piányi)", meaning: "cheap" },
            { word: "打折 (dǎzhé)", meaning: "the sale" },
            { word: "收据 (shōujù)", meaning: "the receipt" },
            { word: "现金 (xiànjīn)", meaning: "the cash" },
            { word: "找零 (zhǎolíng)", meaning: "the change" },
            { word: "袋子 (dàizi)", meaning: "the bag" },
          ],
          // Prices & Bargaining
          [
            { word: "折扣 (zhékòu)", meaning: "the discount" },
            { word: "多少钱？(duōshao qián?)", meaning: "how much?" },
            { word: "总计 (zǒngjì)", meaning: "the total" },
            { word: "付款 (fùkuǎn)", meaning: "to pay" },
            { word: "费用 (fèiyòng)", meaning: "the cost" },
            { word: "免费 (miǎnfèi)", meaning: "free" },
            { word: "钱包 (qiánbāo)", meaning: "the wallet" },
            { word: "信用卡 (xìnyòngkǎ)", meaning: "the credit card" },
          ],
          // Clothing Shopping
          [
            { word: "尺码 (chǐmǎ)", meaning: "the size" },
            { word: "试穿 (shìchuān)", meaning: "to try on" },
            { word: "合身 (héshēn)", meaning: "to fit" },
            { word: "衬衫 (chènshān)", meaning: "the shirt" },
            { word: "连衣裙 (liányīqún)", meaning: "the dress" },
            { word: "鞋子 (xiézi)", meaning: "the shoes" },
            { word: "帽子 (màozi)", meaning: "the hat" },
            { word: "夹克 (jiākè)", meaning: "the jacket" },
          ],
          // Online Shopping
          [
            { word: "订单 (dìngdān)", meaning: "the order" },
            { word: "配送 (pèisòng)", meaning: "the delivery" },
            { word: "退货 (tuìhuò)", meaning: "the return" },
            { word: "评价 (píngjià)", meaning: "the review" },
            { word: "购物车 (gòuwùchē)", meaning: "the cart" },
            { word: "结账 (jiézhàng)", meaning: "to checkout" },
            { word: "包裹 (bāoguǒ)", meaning: "the package" },
            { word: "地址 (dìzhǐ)", meaning: "the address" },
          ],
          // Banking & Finance
          [
            { word: "银行 (yínháng)", meaning: "the bank" },
            { word: "账户 (zhànghù)", meaning: "the account" },
            { word: "存钱 (cúnqián)", meaning: "to save" },
            { word: "花钱 (huāqián)", meaning: "to spend" },
            { word: "钱 (qián)", meaning: "the money" },
            { word: "贷款 (dàikuǎn)", meaning: "the loan" },
            { word: "账单 (zhàngdān)", meaning: "the bill" },
            { word: "转账 (zhuǎnzhàng)", meaning: "the transfer" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[7],
        description: "Entertainment in Chinese",
        words: [
          // Music & Dance
          [
            { word: "歌曲 (gēqǔ)", meaning: "the song" },
            { word: "歌手 (gēshǒu)", meaning: "the singer" },
            { word: "吉他 (jítā)", meaning: "the guitar" },
            { word: "钢琴 (gāngqín)", meaning: "the piano" },
            { word: "音乐会 (yīnyuèhuì)", meaning: "the concert" },
            { word: "舞蹈 (wǔdǎo)", meaning: "the dance" },
            { word: "节奏 (jiézòu)", meaning: "the rhythm" },
            { word: "乐队 (yuèduì)", meaning: "the band" },
          ],
          // Sports & Fitness
          [
            { word: "足球 (zúqiú)", meaning: "soccer" },
            { word: "篮球 (lánqiú)", meaning: "basketball" },
            { word: "游泳 (yóuyǒng)", meaning: "to swim" },
            { word: "跑步 (pǎobù)", meaning: "to run" },
            { word: "健身房 (jiànshēnfáng)", meaning: "the gym" },
            { word: "队伍 (duìwu)", meaning: "the team" },
            { word: "比赛 (bǐsài)", meaning: "the match" },
            { word: "锻炼 (duànliàn)", meaning: "the exercise" },
          ],
          // Movies & TV
          [
            { word: "电影 (diànyǐng)", meaning: "the movie" },
            { word: "演员 (yǎnyuán)", meaning: "the actor" },
            { word: "故事 (gùshi)", meaning: "the story" },
            { word: "搞笑 (gǎoxiào)", meaning: "funny" },
            { word: "恐怖 (kǒngbù)", meaning: "scary" },
            { word: "连续剧 (liánxùjù)", meaning: "the series" },
            { word: "票 (piào)", meaning: "the ticket" },
            { word: "节目 (jiémù)", meaning: "the show" },
          ],
          // Games & Hobbies
          [
            { word: "游戏 (yóuxì)", meaning: "the game" },
            { word: "玩 (wán)", meaning: "to play" },
            { word: "画画 (huàhuà)", meaning: "to draw" },
            { word: "绘画 (huìhuà)", meaning: "to paint" },
            { word: "阅读 (yuèdú)", meaning: "to read" },
            { word: "园艺 (yuányì)", meaning: "the garden" },
            { word: "拼图 (pīntú)", meaning: "the puzzle" },
            { word: "相机 (xiàngjī)", meaning: "the camera" },
          ],
          // Celebrations & Events
          [
            { word: "派对 (pàiduì)", meaning: "the party" },
            { word: "生日 (shēngrì)", meaning: "the birthday" },
            { word: "礼物 (lǐwù)", meaning: "the gift" },
            { word: "庆祝 (qìngzhù)", meaning: "to celebrate" },
            { word: "假日 (jiàrì)", meaning: "the holiday" },
            { word: "婚礼 (hūnlǐ)", meaning: "the wedding" },
            { word: "节日 (jiérì)", meaning: "the festival" },
            { word: "烟花 (yānhuā)", meaning: "the fireworks" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[8],
        description: "Social life in Chinese",
        words: [
          // Making Friends
          [
            { word: "朋友 (péngyou)", meaning: "the friend" },
            { word: "见面 (jiànmiàn)", meaning: "to meet" },
            { word: "介绍 (jièshào)", meaning: "to introduce" },
            { word: "友善 (yǒushàn)", meaning: "nice" },
            { word: "一起 (yīqǐ)", meaning: "together" },
            { word: "邻居 (línjū)", meaning: "the neighbor" },
            { word: "群组 (qúnzǔ)", meaning: "the group" },
            { word: "邀请 (yāoqǐng)", meaning: "to invite" },
          ],
          // Invitations & Plans
          [
            { word: "明天 (míngtiān)", meaning: "tomorrow" },
            { word: "今晚 (jīnwǎn)", meaning: "tonight" },
            { word: "周末 (zhōumò)", meaning: "the weekend" },
            { word: "有空 (yǒukòng)", meaning: "available" },
            { word: "加入 (jiārù)", meaning: "to join" },
            { word: "聚会 (jùhuì)", meaning: "the party" },
            { word: "晚餐 (wǎncān)", meaning: "the dinner" },
            { word: "拜访 (bàifǎng)", meaning: "to visit" },
          ],
          // Feelings & Moods
          [
            { word: "开心 (kāixīn)", meaning: "happy" },
            { word: "难过 (nánguò)", meaning: "sad" },
            { word: "生气 (shēngqì)", meaning: "angry" },
            { word: "疲劳 (píláo)", meaning: "tired" },
            { word: "兴奋 (xīngfèn)", meaning: "excited" },
            { word: "紧张 (jǐnzhāng)", meaning: "nervous" },
            { word: "吃惊 (chījīng)", meaning: "surprised" },
            { word: "平静 (píngjìng)", meaning: "calm" },
          ],
          // Communication
          [
            { word: "交谈 (jiāotán)", meaning: "to talk" },
            { word: "听 (tīng)", meaning: "to listen" },
            { word: "消息 (xiāoxi)", meaning: "the message" },
            { word: "打电话 (dǎ diànhuà)", meaning: "to call" },
            { word: "理解 (lǐjiě)", meaning: "to understand" },
            { word: "同意 (tóngyì)", meaning: "to agree" },
            { word: "不同意 (bù tóngyì)", meaning: "to disagree" },
            { word: "解释 (jiěshì)", meaning: "to explain" },
          ],
          // Relationships
          [
            { word: "爱 (ài)", meaning: "love" },
            { word: "家人 (jiārén)", meaning: "the family" },
            { word: "信任 (xìnrèn)", meaning: "trust" },
            { word: "尊重 (zūnzhòng)", meaning: "respect" },
            { word: "结婚 (jiéhūn)", meaning: "to marry" },
            { word: "伴侣 (bànlǚ)", meaning: "the partner" },
            { word: "想念 (xiǎngniàn)", meaning: "to miss" },
            { word: "关心 (guānxīn)", meaning: "to care" },
          ],
        ],
      },
      {
        ...UNIT_TEMPLATES[9],
        description: "Advanced phrases in Chinese",
        words: [
          // Opinions & Beliefs
          [
            { word: "我认为 (wǒ rènwéi)", meaning: "I think" },
            { word: "我相信 (wǒ xiāngxìn)", meaning: "I believe" },
            { word: "在我看来 (zài wǒ kànlái)", meaning: "in my opinion" },
            { word: "同意 (tóngyì)", meaning: "agree" },
            { word: "不同意 (bù tóngyì)", meaning: "disagree" },
            { word: "也许 (yěxǔ)", meaning: "maybe" },
            { word: "当然 (dāngrán)", meaning: "certainly" },
            { word: "可能 (kěnéng)", meaning: "probably" },
          ],
          // Comparisons
          [
            { word: "更好 (gèng hǎo)", meaning: "better" },
            { word: "更差 (gèng chà)", meaning: "worse" },
            { word: "相同 (xiāngtóng)", meaning: "same" },
            { word: "不同 (bùtóng)", meaning: "different" },
            { word: "更多 (gèng duō)", meaning: "more" },
            { word: "更少 (gèng shǎo)", meaning: "less" },
            { word: "相似 (xiāngsì)", meaning: "similar" },
            { word: "相等 (xiāngděng)", meaning: "equal" },
          ],
          // Requests & Offers
          [
            { word: "你能…吗？(nǐ néng … ma?)", meaning: "could you?" },
            { word: "请 (qǐng)", meaning: "please" },
            { word: "你介意吗？(nǐ jièyì ma?)", meaning: "would you mind?" },
            { word: "帮助 (bāngzhù)", meaning: "to help" },
            { word: "需要 (xūyào)", meaning: "to need" },
            { word: "提供 (tígōng)", meaning: "to offer" },
            { word: "建议 (jiànyì)", meaning: "to suggest" },
            { word: "推荐 (tuījiàn)", meaning: "to recommend" },
          ],
          // Cause & Effect
          [
            { word: "因为 (yīnwèi)", meaning: "because" },
            { word: "因此 (yīncǐ)", meaning: "therefore" },
            { word: "以便 (yǐbiàn)", meaning: "so that" },
            { word: "结果 (jiéguǒ)", meaning: "the result" },
            { word: "原因 (yuányīn)", meaning: "the reason" },
            { word: "导致 (dǎozhì)", meaning: "to lead to" },
            { word: "由于 (yóuyú)", meaning: "due to" },
            { word: "后果 (hòuguǒ)", meaning: "the consequence" },
          ],
          // Common Idioms
          [
            { word: "打破僵局 (dǎpò jiāngjú)", meaning: "break the ice" },
            { word: "小菜一碟 (xiǎocài yī dié)", meaning: "piece of cake" },
            { word: "身体不适 (shēntǐ bú shì)", meaning: "under the weather" },
            { word: "出发上路 (chūfā shànglù)", meaning: "hit the road" },
            { word: "有道理 (yǒu dàolǐ)", meaning: "make sense" },
            { word: "放轻松 (fàng qīngsōng)", meaning: "take it easy" },
            { word: "没什么大不了 (méi shénme dàbuliǎo)", meaning: "no big deal" },
            { word: "收工 (shōugōng)", meaning: "call it a day" },
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
 * Each word produces 3 challenges (SELECT, ASSIST, TYPE) for 15 challenges per lesson.
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

    // --- TYPE challenge: "Translate: 'meaning'" (user must type the word) ---
    const typeIdx = challenges.length;
    challenges.push({
      type: "TYPE",
      question: `Translate: "${wordEntry.meaning}"`,
      order: order++,
    });

    // Single correct option containing the target-language word (used for validation)
    options.push({
      challengeIndex: typeIdx,
      text: wordEntry.word,
      correct: true,
    });
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

    // Track per-language word counts for summary
    const languageWordCounts: { name: string; count: number }[] = [];

    for (const lang of LANGUAGES) {
      // --- Insert course ---
      await db.insert(schema.courses).values({
        id: courseId,
        title: lang.title,
        imageSrc: lang.imageSrc,
      });

      console.log(`  Course: ${lang.title} (id=${courseId})`);

      let langWordCount = 0;
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
          langWordCount += lessonWords.length;
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

      languageWordCounts.push({ name: lang.title, count: langWordCount });
      courseId++;
    }

    console.log("Seeding finished");
    console.log(`  Total courses: ${courseId - 1}`);
    console.log(`  Total units: ${unitId - 1}`);
    console.log(`  Total lessons: ${lessonId - 1}`);
    console.log(`  Total challenges: ${challengeId - 1}`);

    // --- Summary: per-language word counts ---
    console.log("\n--- Vocabulary Summary ---");
    for (const { name, count } of languageWordCounts) {
      const status = count >= 100 ? "PASS" : "FAIL";
      console.log(`  ${name}: ${count} words [${status}]`);
    }
    const totalWords = languageWordCounts.reduce((sum, l) => sum + l.count, 0);
    console.log(`  Total across all languages: ${totalWords} words`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed the database");
  }
};

main();
