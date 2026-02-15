import { Quiz } from "../quiz";
import { getQuizProps } from "../get-quiz-props";

type Props = {
  params: {
    lessonId: number;
  };
};

const LessonIdPage = async ({ params }: Props) => {
  const props = await getQuizProps(params.lessonId);

  return <Quiz {...props} />;
};

export default LessonIdPage;
