import { Quiz } from "./quiz";
import { getQuizProps } from "./get-quiz-props";

const LessonPage = async () => {
  const props = await getQuizProps();

  return <Quiz {...props} />;
};

export default LessonPage;
