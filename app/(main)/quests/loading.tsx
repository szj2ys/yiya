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
        <div className="w-full flex flex-col items-center">
          {/* Image placeholder */}
          <div className="animate-pulse">
            <div className="h-[90px] w-[90px] bg-neutral-200 rounded-full mx-auto" />
          </div>

          {/* Title placeholder */}
          <div className="animate-pulse my-6">
            <div className="h-8 w-40 bg-neutral-200 rounded-xl mx-auto" />
          </div>

          {/* Subtitle placeholder */}
          <div className="animate-pulse mb-6">
            <div className="h-5 w-64 bg-neutral-200 rounded-xl mx-auto" />
          </div>

          {/* 5 quest item placeholders */}
          <div className="animate-pulse w-full space-y-3">
            <div className="h-16 bg-neutral-200 rounded-xl" />
            <div className="h-16 bg-neutral-200 rounded-xl" />
            <div className="h-16 bg-neutral-200 rounded-xl" />
            <div className="h-16 bg-neutral-200 rounded-xl" />
            <div className="h-16 bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
