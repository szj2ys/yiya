type Props = {
  children: React.ReactNode;
};

const OnboardingLayout = ({ children }: Props) => {
  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {children}
    </main>
  );
};

export default OnboardingLayout;
