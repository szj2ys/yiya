import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  index,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
  units: many(units),
}));

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // Unit 1
  description: text("description").notNull(), // Learn the basics of spanish
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
});

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST", "TYPE"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  }),
);

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  }),
);

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  dailyGoal: integer("daily_goal").notNull().default(1),
  lastLessonAt: timestamp("last_lesson_at"),
  weeklyXp: integer("weekly_xp").notNull().default(0),
  weeklyXpResetAt: timestamp("weekly_xp_reset_at"),
  emailReminders: boolean("email_reminders").notNull().default(true),
  timezone: text("timezone"),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
}));

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
});

export const questClaims = pgTable("quest_claims", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  questValue: integer("quest_value").notNull(),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
}, (t) => ({
  userQuestUnique: uniqueIndex("quest_claims_user_id_quest_value_unique").on(t.userId, t.questValue),
}));

export const reviewCardStateEnum = pgEnum("review_card_state", [
  "new",
  "learning",
  "review",
  "relearning",
]);

export const lessonCompletions = pgTable("lesson_completions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (t) => ({
  userDateIndex: index("lesson_completions_user_date_idx").on(t.userId, t.completedAt),
}));

export const lessonCompletionsRelations = relations(lessonCompletions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonCompletions.lessonId],
    references: [lessons.id],
  }),
}));

export const reviewCards = pgTable(
  "review_cards",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    challengeId: integer("challenge_id")
      .references(() => challenges.id, { onDelete: "cascade" })
      .notNull(),
    state: reviewCardStateEnum("state").notNull().default("new"),
    stability: real("stability").notNull().default(0),
    difficulty: real("difficulty").notNull().default(5.0),
    elapsedDays: integer("elapsed_days").notNull().default(0),
    scheduledDays: integer("scheduled_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    due: timestamp("due").notNull().defaultNow(),
    lastReview: timestamp("last_review"),
  },
  (t) => ({
    userChallengeUnique: uniqueIndex(
      "review_cards_user_id_challenge_id_unique",
    ).on(t.userId, t.challengeId),
    userDueIndex: index("review_cards_user_id_due_idx").on(t.userId, t.due),
  }),
);

export const reviewCardsRelations = relations(reviewCards, ({ one }) => ({
  challenge: one(challenges, {
    fields: [reviewCards.challengeId],
    references: [challenges.id],
  }),
}));

export const streakFreezes = pgTable("streak_freezes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  usedDate: text("used_date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  userDateUnique: uniqueIndex("streak_freezes_user_id_used_date_unique").on(t.userId, t.usedDate),
}));

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  userEndpointUnique: uniqueIndex("push_subscriptions_user_endpoint_unique").on(t.userId, t.endpoint),
}));

export const dailyQuestClaims = pgTable("daily_quest_claims", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  questId: text("quest_id").notNull(),
  claimedDate: text("claimed_date").notNull(), // YYYY-MM-DD
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
}, (t) => ({
  userQuestDateUnique: uniqueIndex("daily_quest_claims_user_quest_date_unique").on(t.userId, t.questId, t.claimedDate),
}));
