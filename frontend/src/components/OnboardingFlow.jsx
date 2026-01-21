import React, { useState } from "react";
import {
  Film, Sparkles, Wand2, Users, Clock, ArrowRight,
  ChevronLeft, ChevronRight, CheckCircle, Clapperboard,
  Play, Layers, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to CineCursor",
    subtitle: "AI-Powered Video Production",
    description: "Create professional videos using natural language. Let AI be your director.",
    icon: Clapperboard,
    features: [
      "Generate videos with Sora 2 AI",
      "AI Director powered by Claude",
      "Professional timeline editing",
      "Character consistency across scenes"
    ]
  },
  {
    id: "ai-director",
    title: "Meet Your AI Director",
    subtitle: "Natural Language Film Making",
    description: "Simply describe your vision in natural language. The AI Director will help you create scene plans, suggest improvements, and orchestrate your production.",
    icon: MessageSquare,
    features: [
      "Describe scenes in plain language",
      "Get AI-powered suggestions",
      "Automatic scene planning",
      "Style and continuity guidance"
    ]
  },
  {
    id: "timeline",
    title: "Professional Timeline",
    subtitle: "Arrange and Edit",
    description: "Drag and drop scenes on the timeline. Add transitions, adjust timing, and create a polished final cut.",
    icon: Layers,
    features: [
      "Multi-track timeline",
      "Drag & drop editing",
      "Transitions and effects",
      "Audio track support"
    ]
  },
  {
    id: "characters",
    title: "Character Consistency",
    subtitle: "Maintain Visual Identity",
    description: "Define your characters once, and our AI ensures they look consistent across all scenes using advanced face embedding technology.",
    icon: Users,
    features: [
      "Character profiles",
      "Face consistency AI",
      "Reference image support",
      "Automatic continuity checks"
    ]
  },
  {
    id: "export",
    title: "Export Your Creation",
    subtitle: "Multiple Formats",
    description: "When you're ready, export your video in various formats and resolutions. From social media to cinema quality.",
    icon: Film,
    features: [
      "MP4, MOV, WebM formats",
      "Up to 4K resolution",
      "Web-optimized exports",
      "Batch export support"
    ]
  }
];

export function OnboardingFlow({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#1e1e1e] rounded-2xl border border-[#3c3c3c] overflow-hidden shadow-2xl">
        {/* Progress Bar */}
        <div className="flex gap-1 p-4 bg-[#252526]">
          {ONBOARDING_STEPS.map((s, idx) => (
            <div
              key={s.id}
              className={cn(
                "flex-1 h-1 rounded-full transition-all duration-300",
                idx <= currentStep ? "bg-[#4ec9b0]" : "bg-[#3c3c3c]"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Icon & Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4ec9b0]/20 to-[#8B5CF6]/20 flex items-center justify-center">
              <Icon className="w-8 h-8 text-[#4ec9b0]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{step.title}</h2>
              <p className="text-[#4ec9b0] text-sm">{step.subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#cccccc] text-lg mb-8 leading-relaxed">
            {step.description}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {step.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 bg-[#252526] rounded-lg border border-[#3c3c3c]"
              >
                <CheckCircle className="w-5 h-5 text-[#4ec9b0] flex-shrink-0" />
                <span className="text-[#cccccc] text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {ONBOARDING_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  idx === currentStep
                    ? "bg-[#4ec9b0] scale-125"
                    : completedSteps.includes(idx)
                    ? "bg-[#4ec9b0]/50"
                    : "bg-[#3c3c3c] hover:bg-[#5a5a5a]"
                )}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 bg-[#252526] border-t border-[#3c3c3c]">
          <div className="flex gap-4">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={handlePrevious}
                className="text-[#858585] hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-[#858585] hover:text-white"
            >
              Skip Tutorial
            </Button>
          </div>
          
          <Button
            onClick={handleNext}
            className="bg-[#4ec9b0] hover:bg-[#3db89e] text-black font-medium px-6"
          >
            {isLastStep ? (
              <>
                Get Started
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;
