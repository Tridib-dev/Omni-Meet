import SparkIllustration from "./SparkIllustration";
import TimePlaceIllustration from "./TimePlaceIllustration";
import StoryIllustration from "./StoryIllustration";
import DetailsIllustration from "./DetailsIllustration";
import TicketsIllustration from "./TicketsIllustration";
import OrganizerIllustration from "./OrganizerIllustration";
import ReviewIllustration from "./ReviewIllustration";
import type { WizardStepKey } from "../types";

export const STEP_ILLUSTRATIONS: Record<WizardStepKey, React.ReactNode> = {
  spark: <SparkIllustration />,
  "time-place": <TimePlaceIllustration />,
  story: <StoryIllustration />,
  details: <DetailsIllustration />,
  tickets: <TicketsIllustration />,
  organizer: <OrganizerIllustration />,
  review: <ReviewIllustration />,
};


export const STEP_CAPTIONS: Record<WizardStepKey, { title: string; subtitle: string }> = {
  spark: { title: "Where it all starts", subtitle: "Every great event begins with a simple idea." },
  "time-place": { title: "Set the stage", subtitle: "The when and where shape everything else." },
  story: { title: "Tell it well", subtitle: "A good story is what gets people to show up." },
  details: { title: "Sweat the details", subtitle: "This is what makes attendees feel taken care of." },
  tickets: { title: "Make it easy to say yes", subtitle: "Clear pricing removes the last bit of friction." },
  organizer: { title: "Put a face to it", subtitle: "People trust events more when they know who's behind them." },
  review: { title: "Almost there", subtitle: "One last look before it goes live." },
};
