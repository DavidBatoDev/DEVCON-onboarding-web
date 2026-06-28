import React from "react";
import { Loader2 } from "lucide-react";
import DevconLogo from "./DevconLogo";

interface LoadingModalProps {
  isOpen: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <DevconLogo />

          <Loader2 className="mt-6 h-7 w-7 animate-spin text-primary" />

          <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Initializing DEBBIE…
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            I&apos;m still in beta and using available free credits while we test
            the waters. Answers are pulled from the{" "}
            <a
              href="https://linktr.ee/fordevconchapterleads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              DEVCON Chapter Resources
            </a>{" "}
            and HQ documents — expect a few minutes for a response.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
