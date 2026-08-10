'use client';

import React from "react";
import { EventDraft } from "../types";
import CoverImageField from "../fields/CoverImageField";
import SlideshowImagesField from "../fields/SlideshowImagesField";

interface Step3Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step3Story = ({ draft, onUpdate }: Step3Props) => {
  const maxSlideshowImages = 3;

  const handleFile = (file: File | null) => {
    if (draft.imagePreviewUrl) URL.revokeObjectURL(draft.imagePreviewUrl);
    onUpdate({
      imageFile: file,
      imagePreviewUrl: file ? URL.createObjectURL(file) : null,
    });
  };

  const handleSlideshowFiles = (files: File[]) => {
    const openSlots = maxSlideshowImages - draft.slideshowImageFiles.length;
    if (openSlots <= 0) return;

    const nextFiles = files.slice(0, openSlots);
    const nextPreviewUrls = nextFiles.map((file) => URL.createObjectURL(file));

    onUpdate({
      slideshowImageFiles: [...draft.slideshowImageFiles, ...nextFiles],
      slideshowPreviewUrls: [...draft.slideshowPreviewUrls, ...nextPreviewUrls],
    });
  };

  const handleRemoveSlideshowImage = (index: number) => {
    const previewUrl = draft.slideshowPreviewUrls[index];
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    onUpdate({
      slideshowImageFiles: draft.slideshowImageFiles.filter((_, itemIndex) => itemIndex !== index),
      slideshowPreviewUrls: draft.slideshowPreviewUrls.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <>
      <p className="cew-step-eyebrow">Step 3 of 7</p>
      <h1 className="cew-step-title">Bring it to life</h1>
      <p className="cew-step-subtitle">A strong banner and a clear overview do most of the convincing.</p>

      <div className="cew-step-body">
        <CoverImageField previewUrl={draft.imagePreviewUrl} onFileSelected={handleFile} />
        <SlideshowImagesField
          previewUrls={draft.slideshowPreviewUrls}
          maxImages={maxSlideshowImages}
          onFilesAdded={handleSlideshowFiles}
          onRemove={handleRemoveSlideshowImage}
        />

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
