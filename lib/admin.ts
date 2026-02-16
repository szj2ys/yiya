import { getAuthUserId } from "@/lib/auth-utils";

const adminIds = [
  "user_2dGb6YEarBAQHrNYoB5dMtISRWK",
];

export const isAdmin = async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
