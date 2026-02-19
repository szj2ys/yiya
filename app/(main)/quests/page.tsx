import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { Promo } from "@/components/promo";
import { quests } from "@/constants";
import { QuestItem } from "@/components/quest-item";

const QuestsPage = async () => {
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

  const [
    userProgress,
    userSubscription,
  ] = await Promise.all([
    userProgressData,
    userSubscriptionData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && (
          <Promo />
        )}
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/quests.svg"
            alt="Quests"
            height={90}
            width={90}
          />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            Quests
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            Complete quests by earning points.
          </p>
          <ul className="w-full">
            {quests.map((quest) => (
              <QuestItem
                key={quest.title}
                title={quest.title}
                value={quest.value}
                reward={quest.reward}
                points={userProgress.points}
              />
            ))}
          </ul>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default QuestsPage;
