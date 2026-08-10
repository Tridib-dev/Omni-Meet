'use client';

/* eslint-disable @next/next/no-img-element */

import React, { useRef } from "react";

export interface SlideshowImagesFieldProps {
  previewUrls: string[];
  maxImages: number;
  onFilesAdded: (files: File[]) => void;
  onRemove: (index: number) => void;
}

const SlideshowImagesField = ({
  previewUrls,
  maxImages,
  onFilesAdded,
  onRemove,
}: SlideshowImagesFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const remainingSlots = Math.max(maxImages - previewUrls.length, 0);
  const isFull = remainingSlots === 0;

  const handleFiles = (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length > 0) {
      onFilesAdded(selectedFiles);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="field">
      <label htmlFor="slideshowImages">Slideshow photos</label>
      <div className="cew-slideshow-grid">
        {previewUrls.map((previewUrl, index) => (
          <div className="cew-slideshow-thumb" key={previewUrl}>
            <img src={previewUrl} alt={`Slideshow photo ${index + 1}`} />
            <button type="button" onClick={() => onRemove(index)} aria-label={`Remove slideshow photo ${index + 1}`}>
              x
            </button>
          </div>
        ))}

        {!isFull && (
          <button
            type="button"
            className="cew-slideshow-add"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
          >
            Add photo
            <span>{remainingSlots} left</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id="slideshowImages"
        name="slideshowImages"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="field-hint">Optional. Add up to {maxImages} more photos for the event slideshow.</p>
    </div>
  );
};

export default SlideshowImagesField;
