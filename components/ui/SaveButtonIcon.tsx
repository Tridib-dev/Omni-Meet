// Usage Example


// import SaveButtonIcon from '@/components/ui/SaveButtonIcon';

// export default function MyComponent() {
//   return (
//     <SaveButtonIcon 
//       defaultSaved={false}
//       onToggle={(saved) => console.log('Saved:', saved)}
//       ariaLabel="Pin event"
//     />
//   );
// }


'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SaveButtonIconProps {
  onToggle?: (saved: boolean) => void;
  defaultSaved?: boolean;
  saved?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

export default function SaveButtonIcon({
  onToggle,
  defaultSaved = false,
  saved: controlledSaved,
  loading = false,
  className,
  ariaLabel = 'Pin',
  children,
}: SaveButtonIconProps) {
  const [internalSaved, setInternalSaved] = useState(defaultSaved);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const saved = controlledSaved ?? internalSaved;

  useEffect(() => {
    if (loading || !wrapperRef.current || !fillRef.current) return;

    const wrapper = wrapperRef.current;
    const fill = fillRef.current;

    // Reset animation
    wrapper.style.animation = 'none';
    void wrapper.offsetWidth; // Trigger reflow

    if (saved) {
      // Spring pop animation when saved
      wrapper.style.animation =
        'popSpring 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
      fill.classList.remove('opacity-0', 'scale-75');
      fill.classList.add('opacity-100', 'scale-100');
    } else {
      // Soft pop animation when unsaved
      wrapper.style.animation = 'popSoft 0.3s ease-out forwards';
      fill.classList.remove('opacity-100', 'scale-100');
      fill.classList.add('opacity-0', 'scale-75');
    }
  }, [saved, loading]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    event.preventDefault();
    event.stopPropagation();

    const newState = !saved;
    if (controlledSaved === undefined) {
      setInternalSaved(newState);
    }
    onToggle?.(newState);
  };

  return (
    <>
      <style>{`
        @keyframes popSpring {
          0% { transform: scale(0.85); }
          40% { transform: scale(1.2); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes popSoft {
          0% { transform: scale(1); }
          50% { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        .icon-fill {
          transform-origin: center;
        }
      `}</style>

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className={cn(
          'group inline-flex items-center rounded-xl border px-3 py-2 shadow-sm backdrop-blur-md transform transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 text-zinc-900!',
          // subtle wet-grey hover and pop-up effect; keep text/icon color stable
          saved
            ? 'border-zinc-200/80 bg-zinc-100/95 text-zinc-900! hover:-translate-y-0.5 hover:shadow-md hover:bg-zinc-200 hover:text-zinc-900!'
            : 'border-white/80 bg-white/90 text-zinc-900! ring-1 ring-black/10 hover:-translate-y-0.5 hover:shadow-md hover:bg-white hover:text-zinc-900!',
          className
        )}
        aria-label={ariaLabel}
        aria-pressed={saved}
      >
        {/* Keep the bookmark hidden until the loading state is complete. */}
        {!loading && (
          <div ref={wrapperRef} className="relative z-10 h-5 w-5 shrink-0 text-zinc-900">
            <svg viewBox="0 0 24 24" fill="none" className="h-full w-full overflow-visible">
              <path
                ref={fillRef}
                className="icon-fill transition-all duration-300 ease-out opacity-0 scale-75"
                d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"
                fill="currentColor"
                strokeWidth="0"
              />
              <path
                d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}


        {/* Spinner when loading */}
        {loading && (
          <div className="-mr-1">
            <span className="w-4 h-4 inline-block animate-spin rounded-full border-2 border-transparent border-t-zinc-900" />
          </div>
        )}

        {/* Label (optional) */}
        {children && (
          <span className="ml-3 text-sm font-medium text-zinc-900">
            {children}
          </span>
        )}

      </button>
    </>
  );
}
