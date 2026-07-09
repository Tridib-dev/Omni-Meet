"use client";

// components/ui/Switch.tsx
interface SwitchProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

export default function Switch({ checked, onChange, disabled }: SwitchProps) {
    return (
        <>
            <style>{`
                .dv-switch { font-size: 13px; position: relative; display: inline-block; width: 3.5em; height: 2em; }
                .dv-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
                .dv-slider { position: absolute; cursor: pointer; inset: 0; background: #9fccfa; border-radius: 50px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .dv-slider:before { position: absolute; content: ""; height: 2em; width: 2em; inset: 0; background: white; border-radius: 50px; box-shadow: 0 10px 20px rgba(0,0,0,0.4); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .dv-switch input:checked + .dv-slider { background: #0974f1; }
                .dv-switch input:checked + .dv-slider:before { transform: translateX(1.6em); }
                .dv-switch input:disabled + .dv-slider { opacity: 0.5; cursor: not-allowed; }
            `}</style>
            <label className="dv-switch">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="dv-slider" />
            </label>
        </>
    );
}