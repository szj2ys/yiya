import { getCourses } from "@/db/queries";

import { OnboardingFlow } from "./onboarding-flow";

const OnboardingPage = async () => {
  const courses = await getCourses();

  return <OnboardingFlow courses={courses} />;
};

export default OnboardingPage;
