const Loading = () => {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <div className="hidden lg:block w-[368px] sticky self-end bottom-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-neutral-200 rounded-xl" />
          <div className="h-20 bg-neutral-200 rounded-xl" />
        </div>
      </div>
      <div className="flex-1 relative top-0 pb-10">
        <div className="w-full flex flex-col items-center animate-pulse">
          <div className="h-[90px] w-[90px] bg-neutral-200 rounded-full" />
          <div className="h-8 w-48 bg-neutral-200 rounded-xl my-6" />
          <div className="h-5 w-64 bg-neutral-200 rounded-xl mb-6" />

          <div className="w-full grid grid-cols-3 gap-3 mb-8">
            <div className="h-36 bg-neutral-200 rounded-2xl mt-4" />
            <div className="h-40 bg-neutral-200 rounded-2xl" />
            <div className="h-36 bg-neutral-200 rounded-2xl mt-4" />
          </div>

          <div className="w-full space-y-3">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="h-14 bg-neutral-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
