'use client';

import React, { useState } from "react";

export interface AgendaItemInput {
    id: string;
    startTime: string;
    endTime: string;
    keynote: string;
}

interface AgendaFieldsProps {
    onChange: (items: AgendaItemInput[]) => void;
}

const createId = () => Math.random().toString(36).slice(2, 9);

const AgendaFields = ({ onChange }: AgendaFieldsProps) => {
    const [rows, setRows] = useState<AgendaItemInput[]>([
        { id: "agenda-initial", startTime: "", endTime: "", keynote: "" },
    ]);

    const emit = (next: AgendaItemInput[]) => {
        setRows(next);
        onChange(next);
    };

    const addRow = () => {
        emit([...rows, { id: createId(), startTime: "", endTime: "", keynote: "" }]);
    };

    const removeRow = (id: string) => {
        if (rows.length === 1) return;
        emit(rows.filter((row) => row.id !== id));
    };

    const updateRow = (id: string, field: keyof Omit<AgendaItemInput, "id">, value: string) => {
        emit(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    // Per-row check: only flag once both times are filled
    const getRowError = (row: AgendaItemInput): string | null => {
        if (row.startTime && row.endTime && row.endTime <= row.startTime) {
            return "End time must be after start time.";
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
                                type="time"
                                value={row.startTime}
                                onChange={(e) => updateRow(row.id, "startTime", e.target.value)}
                                aria-label="Start time"
                                required
                            />
                            <span className="agenda-row-separator">to</span>
                            <input
                                type="time"
                                value={row.endTime}
                                onChange={(e) => updateRow(row.id, "endTime", e.target.value)}
                                aria-label="End time"
                                required
                            />
                            <input
                                type="text"
                                value={row.keynote}
                                onChange={(e) => updateRow(row.id, "keynote", e.target.value)}
                                placeholder="Keynote: AI-Driven Cloud Infrastructure"
                                aria-label="Session name"
                                required
                                className="agenda-keynote-input"
                            />
                            <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                className="row-remove"
                                disabled={rows.length === 1}
                                aria-label="Remove agenda item"
                            >
                                &times;
                            </button>
                        </div>
                        {error && <p className="field-error">{error}</p>}
                    </div>
                );
            })}

            <button type="button" onClick={addRow} className="row-add">
                + Add agenda item
            </button>
        </div>
    );
};

export default AgendaFields;