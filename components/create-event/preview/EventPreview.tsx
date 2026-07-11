'use client';

import React from "react";
import { EventDraft } from "../types";

const formatDate = (value: string) => {
  if (!value) return "Date TBD";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

const EventPreview = ({ draft }: { draft: EventDraft }) => {
  return (
    <div
      style={{
        border: "1.5px solid var(--cew-line)",
        borderRadius: "var(--cew-radius-lg)",
        overflow: "hidden",
        background: "var(--cew-paper)",
      }}
    >
      <div
        style={{
          aspectRatio: "16 / 6",
          background: draft.imagePreviewUrl
            ? `center / cover no-repeat url(${draft.imagePreviewUrl})`
            : "var(--cew-blue-tint)",
        }}
      />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span className="pill">{draft.category || "Category"}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: draft.isFree ? "var(--cew-success)" : "var(--cew-blue)" }}>
            {draft.isFree ? "Free" : `₹${draft.price || 0}`}
          </span>
        </div>

        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "var(--cew-ink)" }}>
          {draft.title || "Untitled event"}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--cew-ink-soft)" }}>{draft.tagline}</p>

        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--cew-ink-soft)", flexWrap: "wrap" }}>
          <span>📅 {formatDate(draft.date)}{draft.time ? ` · ${draft.time}` : ""}</span>
          <span>📍 {draft.venue ? `${draft.venue}, ${draft.location.city || "City TBD"}` : "Location TBD"}</span>
          <span>{draft.mode || "Mode TBD"}</span>
        </div>

        {draft.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {draft.tags.map((tag) => (
              <span className="pill" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--cew-ink-soft)", lineHeight: 1.5 }}>
          {draft.overview || "No overview added yet."}
        </p>

        {draft.agenda.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--cew-ink-soft)", margin: "0 0 6px" }}>
              Agenda
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {draft.agenda.map((item) => (
                <div key={item.id} style={{ fontSize: 13, color: "var(--cew-ink)", display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--cew-blue)", fontWeight: 600, minWidth: 96 }}>
                    {item.startTime}–{item.endTime}
                  </span>
                  <span>{item.keynote}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPreview;
