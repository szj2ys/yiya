"use client";

import { useState } from "react";
import Image from "next/image";
import { InfinityIcon, Volume2, VolumeX, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";
import { isMuted, toggleMute } from "@/lib/tts";

type Props = {
  hearts: number;
  percentage: number;
  hasActiveSubscription: boolean;
};

export const Header = ({
  hearts,
  percentage,
  hasActiveSubscription,
}: Props) => {
  const { open } = useExitModal();
  const [muted, setMuted] = useState(() => isMuted());

  const handleToggleMute = () => {
    const next = toggleMute();
    setMuted(next);
  };

  const MuteIcon = muted ? VolumeX : Volume2;

  return (
    <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
      <X
        onClick={open}
        className="text-slate-500 hover:opacity-75 transition cursor-pointer"
      />
      <Progress value={percentage} />
      <button
        type="button"
        onClick={handleToggleMute}
        aria-label={muted ? "Unmute sound" : "Mute sound"}
        className="flex items-center justify-center w-11 h-11 shrink-0 rounded-full text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
      >
        <MuteIcon className="h-5 w-5" />
      </button>
      <div className="text-rose-500 flex items-center font-bold">
        <Image
          src="/heart.svg"
          height={28}
          width={28}
          alt="Heart"
          className="mr-2"
        />
        {hasActiveSubscription
          ? <InfinityIcon className="h-6 w-6 stroke-[3] shrink-0" />
          : hearts
        }
      </div>
    </header>
  );
};
