'use client';

import React, { useRef } from "react";

export interface CoverImageFieldProps {
  previewUrl: string | null;
  onFileSelected: (file: File | null) => void;
}

const CoverImageField = ({ previewUrl, onFileSelected }: CoverImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    onFileSelected(file);
  };

  return (
    <div className="field">
      <label htmlFor="image">Banner image</label>
      <div
        className="cew-cover-drop"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Banner preview" />
        ) : (
          <div className="cew-cover-drop-placeholder">
            Click or drag an image here
            <br />
            JPG, PNG, or WebP — up to 3MB
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        id="image"
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="field-hint">This is the first thing people see — pick something sharp and bright.</p>
    </div>
  );
};

export default CoverImageField;
