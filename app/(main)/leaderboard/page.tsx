import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getTopTenUsers, getUserProgress, getUserSubscription, getUserRank } from "@/db/queries";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { getAuthUserId } from "@/lib/auth-utils";

const MEDALS = ["🥇", "🥈", "🥉"] as const;

const LeaderboardPage = async () => {
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  const leaderboardData = getTopTenUsers();
  const userRankData = getUserRank();
  const currentUserIdData = getAuthUserId();

  const [
    userProgress,
    userSubscription,
    leaderboard,
    userRank,
    currentUserId,
  ] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    leaderboardData,
    userRankData,
    currentUserIdData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Check if current user is in the top 10
  const currentUserInTop10 = leaderboard.find(
    (u: typeof leaderboard[number]) => u.userId === currentUserId,
  );

  // XP needed to enter top 10
  const xpToTop10 =
    !currentUserInTop10 && leaderboard.length >= 10
      ? leaderboard[leaderboard.length - 1].points - (userProgress.points ?? 0) + 1
      : 0;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && <Promo />}
        <Quests points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/leaderboard.svg"
            alt="Leaderboard"
            height={90}
            width={90}
          />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            This week&apos;s top learners
          </p>

          {/* Empty state */}
          {leaderboard.length < 3 && leaderboard.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground text-center text-base">
                Be the first to climb the ranks!
              </p>
            </div>
          )}

          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div
              className="w-full grid grid-cols-3 gap-3 mb-8"
              data-testid="podium"
            >
              {/* Podium order: #2 (left), #1 (center), #3 (right) */}
              {[1, 0, 2].map((podiumIndex) => {
                const user = top3[podiumIndex];
                if (!user) {
                  return <div key={podiumIndex} />;
                }

                const isFirst = podiumIndex === 0;
                const isCurrentUser = user.userId === currentUserId;

                const bgClass =
                  podiumIndex === 0
                    ? "bg-amber-50 border-amber-200"
                    : podiumIndex === 1
                      ? "bg-neutral-100 border-neutral-200"
                      : "bg-orange-50 border-orange-200";

                return (
                  <div
                    key={user.userId}
                    className={`flex flex-col items-center rounded-2xl border p-4 ${bgClass} ${
                      isFirst ? "pt-6 pb-6" : "mt-4"
                    } ${
                      isCurrentUser
                        ? "ring-2 ring-green-200 bg-green-50"
                        : ""
                    }`}
                  >
                    <span className="text-2xl mb-2">
                      {MEDALS[podiumIndex]}
                    </span>
                    <Avatar
                      className={`border-2 border-white shadow-sm bg-green-500 ${
                        isFirst ? "h-16 w-16" : "h-12 w-12"
                      }`}
                    >
                      <AvatarImage
                        className="object-cover"
                        src={user.userImageSrc}
                      />
                    </Avatar>
                    <p className="font-bold text-neutral-800 text-sm mt-2 text-center truncate w-full">
                      {user.userName}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {user.points} XP
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Graceful handling for fewer than 3 users */}
          {leaderboard.length > 0 && leaderboard.length < 3 && (
            <p className="text-muted-foreground text-center text-sm mb-4">
              Be the first to climb the ranks!
            </p>
          )}

          {/* Rest of list (#4-#10) */}
          {rest.length > 0 && (
            <>
              <Separator className="mb-4 h-0.5 rounded-full" />
              {rest.map((user: typeof rest[number], index: number) => {
                const globalIndex = index + 3;
                const isCurrentUser = user.userId === currentUserId;

                return (
                  <div
                    key={user.userId}
                    className={`flex items-center w-full p-3 px-4 rounded-xl hover:bg-gray-200/50 ${
                      isCurrentUser
                        ? "ring-2 ring-green-200 bg-green-50"
                        : globalIndex % 2 === 1
                          ? "bg-neutral-50"
                          : "bg-white"
                    }`}
                  >
                    <p className="font-bold text-neutral-500 mr-4 w-8 text-center">
                      {globalIndex + 1}
                    </p>
                    <Avatar className="border bg-green-500 h-10 w-10 mr-4">
                      <AvatarImage
                        className="object-cover"
                        src={user.userImageSrc}
                      />
                    </Avatar>
                    <p className="font-bold text-neutral-800 flex-1">
                      {user.userName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {user.points} XP
                    </p>
                  </div>
                );
              })}
            </>
          )}

          {/* Current user ranking section (when not in top 10) */}
          {!currentUserInTop10 && userRank && (
            <>
              <Separator className="my-6 h-0.5 rounded-full" />
              <div
                className="w-full rounded-2xl border border-green-200 bg-green-50 p-4"
                data-testid="your-ranking"
              >
                <p className="text-sm font-semibold text-green-700 mb-3">
                  Your ranking
                </p>
                <div className="flex items-center">
                  <p className="font-bold text-green-600 mr-4 w-8 text-center">
                    {userRank.rank}
                  </p>
                  <Avatar className="border bg-green-500 h-10 w-10 mr-4">
                    <AvatarImage
                      className="object-cover"
                      src={userProgress.userImageSrc}
                    />
                  </Avatar>
                  <p className="font-bold text-neutral-800 flex-1">
                    {userProgress.userName}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {userProgress.points} XP
                  </p>
                </div>
                {xpToTop10 > 0 && (
                  <p className="text-sm text-green-600 mt-3 text-center font-medium">
                    {xpToTop10} XP to enter top 10
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
