'use client';
import { ArrowRight } from 'lucide-react';

export default function FlowButtonV1({
  text = "Get Started",
  ...rest
}: {
  text?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`flow-btn-glow group relative flex items-center gap-1 overflow-hidden
                 rounded-[100px] border-[1.5px] border-white/30 bg-transparent px-8 py-3
                 text-sm font-semibold text-white cursor-pointer transition-all duration-[600ms]
                 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-black
                 hover:rounded-[12px] active:scale-[0.95] ${rest.className ?? ''}`}
    >
      <ArrowRight
        className="absolute w-4 h-4 left-[-25%] stroke-white fill-none z-[9]
                   group-hover:left-4 group-hover:stroke-black transition-all duration-[800ms]
                   ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>
      <span className="absolute inset-0 rounded-[inherit] bg-white scale-0 origin-center opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-[700ms] ease-[cubic-bezier(0.19,1,0.22,1)]" />
      <ArrowRight
        className="absolute w-4 h-4 right-4 stroke-white fill-none z-[9]
                   group-hover:right-[-25%] group-hover:stroke-black transition-all duration-[800ms]
                   ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />
    </button>
  );
}
