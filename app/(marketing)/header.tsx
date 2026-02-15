import Image from "next/image";
import { Loader } from "lucide-react";
import { 
  ClerkLoaded, 
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/80 px-4 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/mascot.svg" height={36} width={36} alt="Yiya" />
          <h1 className="text-xl font-extrabold text-green-600 tracking-tight">
            Yiya
          </h1>
        </div>
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
            />
          </SignedIn>
          <SignedOut>
            <SignInButton
              mode="modal"
              afterSignInUrl="/learn"
              afterSignUpUrl="/learn"
            >
              <Button
                size="lg"
                variant="ghost"
                className="h-11 rounded-2xl text-sm normal-case tracking-normal"
              >
                Log in
              </Button>
            </SignInButton>
          </SignedOut>
        </ClerkLoaded>
      </div>
    </header>
  );
};
