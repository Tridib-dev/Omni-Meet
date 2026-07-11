'use client';

import React from "react";
import { EventDraft } from "../types";
import CoverImageField from "../fields/CoverImageField";

interface Step3Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step3Story = ({ draft, onUpdate }: Step3Props) => {
  const handleFile = (file: File | null) => {
    if (draft.imagePreviewUrl) URL.revokeObjectURL(draft.imagePreviewUrl);
    onUpdate({
      imageFile: file,
      imagePreviewUrl: file ? URL.createObjectURL(file) : null,
    });
  };

  return (
    <>
      <p className="cew-step-eyebrow">Step 3 of 7</p>
      <h1 className="cew-step-title">Bring it to life</h1>
      <p className="cew-step-subtitle">A strong banner and a clear overview do most of the convincing.</p>

      <div className="cew-step-body">
        <CoverImageField previewUrl={draft.imagePreviewUrl} onFileSelected={handleFile} />

        <div className="field">
          <label htmlFor="overview">Overview</label>
          <textarea
            id="overview"
            name="overview"
            rows={6}
            value={draft.overview}
            onChange={(e) => onUpdate({ overview: e.target.value })}
            placeholder="What can attendees expect? Who's speaking, what will they walk away with?"
          />
        </div>
      </div>
    </>
  );
};

export default Step3Story;
