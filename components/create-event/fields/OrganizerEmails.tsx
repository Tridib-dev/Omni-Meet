'use client';

import React, { useState } from "react";

export interface OrganizerEmailsProps {
    onChange: (emails: string[]) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OrganizerEmails = ({ onChange }: OrganizerEmailsProps) => {
    const [emails, setEmails] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const emit = (next: string[]) => {
        setEmails(next);
        onChange(next);
    };

    const addEmail = (raw: string) => {
        const cleaned = raw.trim().toLowerCase();
        if (!cleaned) return;

        if (!EMAIL_PATTERN.test(cleaned)) {
            setError(`"${cleaned}" doesn't look like a valid email.`);
            return;
        }

        if (emails.includes(cleaned)) {
            setError(`"${cleaned}" is already added.`);
            setInputValue("");
            return;
        }

        emit([...emails, cleaned]);
        setInputValue("");
        setError(null);
    };

    const removeEmail = (email: string) => {
        emit(emails.filter((e) => e !== email));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addEmail(inputValue);
        } else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
            removeEmail(emails[emails.length - 1]);
        }
    };

    return (
        <div>
            <div className="tag-input-wrapper">
                {emails.map((email) => (
                    <span className="pill pill-removable" key={email}>
                        {email}
                        <button type="button" onClick={() => removeEmail(email)} aria-label={`Remove ${email}`}>
                            &times;
                        </button>
                    </span>
                ))}
                <input
                    type="email"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addEmail(inputValue)}
                    placeholder={emails.length === 0 ? "contact@organizer.com" : ""}
                />
            </div>

            {error ? (
                <p className="field-error">{error}</p>
            ) : (
                <p className="field-hint">Press Enter or comma to add another email.</p>
            )}
        </div>
    );
};

export default OrganizerEmails;