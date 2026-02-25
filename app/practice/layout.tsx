type Props = {
  children: React.ReactNode;
};

const PracticeLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col h-full w-full">
      {children}
    </div>
  );
};

export default PracticeLayout;
