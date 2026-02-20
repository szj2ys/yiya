const Loading = () => {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <div className="hidden lg:block w-[368px] sticky self-end bottom-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-neutral-200 rounded-xl" />
          <div className="h-24 bg-neutral-200 rounded-xl" />
          <div className="h-20 bg-neutral-200 rounded-xl" />
        </div>
      </div>
      <div className="flex-1 relative top-0 pb-10 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-neutral-200 rounded-xl" />
        <div className="h-24 bg-neutral-200 rounded-2xl" />
        <div className="h-28 bg-neutral-200 rounded-2xl" />
        <div className="h-16 bg-neutral-200 rounded-2xl" />
        <div className="h-32 bg-neutral-200 rounded-2xl" />
        <div className="h-40 bg-neutral-200 rounded-2xl" />
        <div className="h-40 bg-neutral-200 rounded-2xl" />
        <div className="h-40 bg-neutral-200 rounded-2xl" />
      </div>
    </div>
  );
};

export default Loading;
