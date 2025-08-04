import React from "react";
import { Loader2, Sparkles, Zap, Bot } from "lucide-react";
import DevconLogo from "./DevconLogo";

interface LoadingModalProps {
  isOpen: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
      <div className="relative bg-gradient-to-br from-devcon-background via-devcon-background/95 to-devcon-background/90 rounded-2xl p-8 max-w-lg mx-4 shadow-2xl border border-white/10 animate-fade-in">
        {/* Animated background elements */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-devcon-yellow/5 via-devcon-orange/5 to-devcon-purple/5 animate-pulse-slow" />
        <div className="absolute -top-1 -left-1 w-20 h-20 bg-gradient-to-br from-devcon-yellow/20 to-devcon-orange/20 rounded-full blur-xl animate-float" />
        <div
          className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-br from-devcon-purple/20 to-devcon-green/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10">
          {/* Header with logo and branding */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-devcon-yellow animate-pulse" />
                <Sparkles
                  className="h-4 w-4 text-devcon-orange absolute -top-1 -right-1 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-1">DEBBIE</h2>
                <p className="text-xs text-muted-foreground">
                  DEVCON Officer Bot
                </p>
              </div>
            </div>
          </div>

          {/* Main loading content */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-devcon-yellow animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-devcon-yellow/30 animate-ping" />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3 text-white">
              Initializing DEBBIE...
            </h3>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-devcon-yellow rounded-full animate-pulse" />
                <div
                  className="w-2 h-2 bg-devcon-orange rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-2 h-2 bg-devcon-purple rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>

          {/* Status message */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-devcon-yellow mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  I'm still in beta and using available free credits while we
                  test the waters. I'm currently pulling answers from the{" "}
                  <a
                    href="https://linktr.ee/fordevconchapterleads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-devcon-yellow hover:text-devcon-orange transition-colors underline"
                  >
                    DEVCON Chapter Resources
                  </a>{" "}
                  and HQ documents.
                </p>
                <p className="text-devcon-yellow font-medium">
                  ⏱️ Expect a few minutes for a response!
                </p>
              </div>
            </div>
          </div>

          {/* DEVCON branding */}
          <div className="flex items-center justify-center mt-6 pt-4 border-t border-white/10">
            <DevconLogo className="opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
