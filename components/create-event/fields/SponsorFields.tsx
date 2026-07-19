'use client';

import React, { useState } from "react";

export interface SponsorItemInput {
    id: string;
    name: string;
    website: string;
}

interface SponsorFieldsProps {
    onChange: (items: SponsorItemInput[]) => void;
}

const createId = () => Math.random().toString(36).slice(2, 9);

const WEBSITE_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

const SponsorFields = ({ onChange }: SponsorFieldsProps) => {
    const [rows, setRows] = useState<SponsorItemInput[]>([
        { id: "sponsor-initial", name: "", website: "" },
    ]);

    const emit = (next: SponsorItemInput[]) => {
        setRows(next);
        onChange(next);
    };

    const addRow = () => {
        emit([...rows, { id: createId(), name: "", website: "" }]);
    };

    const removeRow = (id: string) => {
        if (rows.length === 1) return;
        emit(rows.filter((row) => row.id !== id));
    };

    const updateRow = (id: string, field: keyof Omit<SponsorItemInput, "id">, value: string) => {
        emit(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    // Only flag once something's actually been typed — don't nag on an empty untouched row
    const getRowError = (row: SponsorItemInput): string | null => {
        if (row.website && !WEBSITE_PATTERN.test(row.website.trim())) {
            return "Doesn't look like a valid website or social link.";
        }
        return null;
    };

    return (
        <div className="agenda-rows">
            {rows.map((row) => {
                const error = getRowError(row);
                return (
                    <div className="agenda-row-block" key={row.id}>
                        <div className="agenda-row-fields">
                            <input
                                type="text"
                                value={row.name}
                                onChange={(e) => updateRow(row.id, "name", e.target.value)}
                                placeholder="Sponsor name"
                                aria-label="Sponsor name"
                                required
                                className="agenda-keynote-input"
                            />
                            <input
                                type="text"
                                value={row.website}
                                onChange={(e) => updateRow(row.id, "website", e.target.value)}
                                placeholder="Website or social link (acme.com, instagram.com/acme...)"
                                aria-label="Sponsor website or social link"
                                required
                                className="agenda-keynote-input"
                            />
                            <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                className="row-remove"
                                disabled={rows.length === 1}
                                aria-label="Remove sponsor"
                            >
                                &times;
                            </button>
                        </div>
                        {error && <p className="field-error">{error}</p>}
                    </div>
                );
            })}

            <button type="button" onClick={addRow} className="row-add">
                + Add sponsor
            </button>
            <p className="field-hint">
                Just the name and a link for now — we&apos;ll pull the logo automatically (social profile photo or
                site favicon) in a future update.
            </p>
        </div>
    );
};

export default SponsorFields;
