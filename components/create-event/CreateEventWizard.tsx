'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import "./styles/create-event-wizard.css";

import WizardShell from "./WizardShell";
import WizardSkeleton from "./WizardSkeleton";
import StepNav from "./StepNav";
import { useEventDraft } from "./useEventDraft";
import { WIZARD_STEPS, WizardStepKey, validateStep } from "./types";

import Step1Spark from "./steps/Step1Spark";
import Step2TimePlace from "./steps/Step2TimePlace";
import Step3Story from "./steps/Step3Story";
import Step4Details from "./steps/Step4Details";
import Step5Tickets from "./steps/Step5Tickets";
import Step6Organizer from "./steps/Step6Organizer";
import Step7Review from "./steps/Step7Review";

const ILLUSTRATION_CAPTIONS: Record<WizardStepKey, string> = {
  spark: "a spark / idea taking shape",
  "time-place": "a pin dropping on a map",
  story: "a photo developing / storytelling",
  details: "a checklist or agenda coming together",
  tickets: "a ticket or coin doodle",
  organizer: "a handshake / people icon",
  review: "a event card being handed over, ready to publish",
};

const stepIndex = (key: WizardStepKey) => WIZARD_STEPS.findIndex((s) => s.key === key);

const buildFormData = (draft: ReturnType<typeof useEventDraft>["draft"]): FormData => {
  const fd = new FormData();

  fd.append("title", draft.title);
  fd.append("description", draft.tagline);
  fd.append("overview", draft.overview);
  fd.append("venue", draft.venue);
  fd.append("address", draft.address);
  fd.append("country", draft.location.country);
  fd.append("state", draft.location.state);
  fd.append("city", draft.location.city);
  fd.append("location", `${draft.location.city}, ${draft.location.state}`);
  fd.append("category", draft.category);
  fd.append("date", draft.date);
  fd.append("time", draft.time);
  fd.append("mode", draft.mode);
  fd.append("audience", draft.audience);
  fd.append("organizer", draft.organizer);
  fd.append("price", String(draft.isFree ? 0 : draft.price));
  fd.append("sponsors", JSON.stringify(draft.sponsors));
  fd.append("agenda", JSON.stringify(draft.agenda.map(({ id: _id, ...rest }) => rest)));

  draft.tags.forEach((tag) => fd.append("tags", tag));
  draft.organizerEmails.forEach((email) => fd.append("organizerEmails", email));

  if (draft.imageFile) {
    fd.append("image", draft.imageFile);
  }

  return fd;
};

const CreateEventWizard = () => {
  const router = useRouter();
  const { draft, updateDraft, resetDraft, isHydrated } = useEventDraft();
  const [currentStep, setCurrentStep] = useState<WizardStepKey>("spark");
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isHydrated) {
    return <WizardSkeleton />;
  }

  const currentIndex = stepIndex(currentStep);
  const isLastStep = currentStep === "review";
  const isFirstStep = currentStep === "spark";
  const canAdvance = validateStep(draft, currentStep);

  const goTo = (step: WizardStepKey) => {
    setCurrentStep(step);
    // Keep step transitions feeling instant on mobile without fighting the keyboard.
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const handleBack = () => {
    if (isFirstStep) return;
    goTo(WIZARD_STEPS[currentIndex - 1].key);
  };

  const handlePublish = async () => {
    if (isPublishing) return;

    // Final full-draft validation gate, not just the current step.
    const firstInvalid = WIZARD_STEPS.find((s) => s.key !== "review" && !validateStep(draft, s.key));
    if (firstInvalid) {
      toast.error(`Please finish "${firstInvalid.label}" before publishing.`);
      goTo(firstInvalid.key);
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        body: buildFormData(draft),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Event creation failed.");
      }

      toast.success("Event created — it's live now.");
      resetDraft();
      const slug = data?.event?.slug;
      router.push(slug ? `/events/${slug}` : "/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleContinue = () => {
    if (!canAdvance) {
      toast.error("Fill in the required fields to continue.");
      return;
    }
    if (isLastStep) {
      handlePublish();
      return;
    }
    goTo(WIZARD_STEPS[currentIndex + 1].key);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "spark":
        return <Step1Spark draft={draft} onUpdate={updateDraft} />;
      case "time-place":
        return <Step2TimePlace draft={draft} onUpdate={updateDraft} />;
      case "story":
        return <Step3Story draft={draft} onUpdate={updateDraft} />;
      case "details":
        return <Step4Details draft={draft} onUpdate={updateDraft} />;
      case "tickets":
        return <Step5Tickets draft={draft} onUpdate={updateDraft} />;
      case "organizer":
        return <Step6Organizer draft={draft} onUpdate={updateDraft} />;
      case "review":
        return <Step7Review draft={draft} onJumpToStep={goTo} />;
      default:
        return null;
    }
  };

  return (
    <WizardShell currentStep={currentStep} illustrationCaption={ILLUSTRATION_CAPTIONS[currentStep]}>
      {renderStep()}
      <StepNav
        onBack={handleBack}
        onContinue={handleContinue}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isContinueDisabled={!canAdvance}
        isLoading={isPublishing}
      />
    </WizardShell>
  );
};

export default CreateEventWizard;
