'use client';

import React, { useMemo, useRef, useState } from "react";
import { ALL_TAGS } from "@/lib/constants/event-taxonomy";

export interface TagPickerProps {
    onChange: (tags: string[]) => void;
}

const TagPicker = ({ onChange }: TagPickerProps) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedLower = useMemo(
        () => new Set(selected.map((t) => t.toLowerCase())),
        [selected]
    );

    const filteredGroups = useMemo(() => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return [];

        const matches = ALL_TAGS.filter(
            ({ tag }) => tag.toLowerCase().includes(query) && !selectedLower.has(tag.toLowerCase())
        );

        const grouped = new Map<string, string[]>();
        matches.forEach(({ tag, category }) => {
            if (!grouped.has(category)) grouped.set(category, []);
            grouped.get(category)!.push(tag);
        });

        return Array.from(grouped.entries());
    }, [inputValue, selectedLower]);

    const exactMatchExists = useMemo(() => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return true;
        return ALL_TAGS.some(({ tag }) => tag.toLowerCase() === query);
    }, [inputValue]);

    const emit = (next: string[]) => {
        setSelected(next);
        onChange(next);
    };

    const addTag = (raw: string) => {
        const cleaned = raw.trim();
        if (!cleaned) return;
        if (selectedLower.has(cleaned.toLowerCase())) {
            setInputValue("");
            return;
        }
        emit([...selected, cleaned]);
        setInputValue("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const removeTag = (tag: string) => {
        emit(selected.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && selected.length > 0) {
            removeTag(selected[selected.length - 1]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className="tag-picker">
            <div className="tag-input-wrapper">
                {selected.map((tag) => (
                    <span className="pill pill-removable" key={tag}>
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                            &times;
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                    onKeyDown={handleKeyDown}
                    placeholder={selected.length === 0 ? "Search or type a tag..." : ""}
                />
            </div>

            {isOpen && inputValue.trim() && (
                <div className="tag-suggestions">
                    {filteredGroups.length === 0 && (
                        <p className="tag-suggestions-empty">No matches in our list.</p>
                    )}

                    {filteredGroups.map(([category, tags]) => (
                        <div className="tag-suggestion-group" key={category}>
                            <p className="tag-suggestion-category">{category}</p>
                            {tags.map((tag) => (
                                <button
                                    type="button"
                                    key={tag}
                                    className="tag-suggestion-item"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        addTag(tag);
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    ))}

                    {!exactMatchExists && (
                        <button
                            type="button"
                            className="tag-suggestion-custom"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                addTag(inputValue);
                            }}
                        >
                            + Add &ldquo;{inputValue.trim()}&rdquo; as a new tag
                        </button>
                    )}
                </div>
            )}

            <p className="field-hint">Search the list or type your own, then press Enter.</p>
        </div>
    );
};

export default TagPicker;
