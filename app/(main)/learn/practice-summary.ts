const SECONDS_PER_ITEM = 15;
const SECONDS_PER_MINUTE = 60;

export const getReviewSummary = (reviewItemCount: number) => {
  if (reviewItemCount <= 0) {
    return "No items to review";
  }

  const estimatedMinutes = Math.ceil(
    (reviewItemCount * SECONDS_PER_ITEM) / SECONDS_PER_MINUTE,
  );

  return `${reviewItemCount} items · ~${estimatedMinutes} min`;
};

