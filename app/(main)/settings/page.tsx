import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { getUserProgress, getCourses } from "@/db/queries";

import { SettingsForm } from "./settings-form";
import { ThemeToggle } from "./theme-toggle";
import { SoundToggle } from "./sound-toggle";

const SettingsPage = async () => {
  const userProgressData = getUserProgress();
  const coursesData = getCourses();

  const [userProgress, courses] = await Promise.all([
    userProgressData,
    coursesData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/settings.svg"
            alt="Settings"
            height={90}
            width={90}
          />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            Settings
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            Manage your learning preferences.
          </p>
          <SettingsForm
            courses={courses}
            currentCourseId={userProgress.activeCourseId!}
            currentDailyGoal={userProgress.dailyGoal}
          />
          <div className="mt-10 w-full">
            <ThemeToggle />
          </div>
          <div className="mt-10 w-full">
            <SoundToggle />
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default SettingsPage;
