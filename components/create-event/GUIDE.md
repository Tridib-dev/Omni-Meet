# OptionCard — how it's built, and how to use it

## The mental model
There's one component, `OptionCard`, that knows how to be a clickable
card: it tracks hover/press so it can show the right `data-state`, it
knows what "selected" looks like, and it has one reserved spot — the
bottom-right corner — for a piece of art. Every specific card type
(mode, category, ticket, and anything new) is just **a list of data**
handed to `OptionCard` in a loop. You are never writing card CSS or
click-state logic again — you're only ever writing the *content* of a
card (title, description, icon, art) and the *list* of options.

```
OptionCard.tsx          ← the only place hover/press/selected/art-slot logic lives
  ↑ used by
ModeCards.tsx            ← 3 items: In-Person / Online / Hybrid
FreePaidToggle.tsx        ← 2 items: Free / Paid
Step1Spark.tsx (category) ← 14 items: Conference / Meetup / ...
  ↑ and any new card type you add
```

## What `OptionCard` actually renders
```tsx
<button
  className="cew-option-card [+ variant class]"
  data-state="normal | hover | active"   // real pointer tracking, not bare CSS :hover
  data-selected="true | false"
>
  <div className="cew-halo" />            {/* glows only when selected */}
  <span className="cew-option-card-icon">{icon}</span>       {/* optional */}
  <span className="cew-option-card-label">{title}</span>
  <span className="cew-option-card-desc">{description}</span> {/* optional */}
  <span className="cew-card-art">{art}</span>                {/* optional — bottom-right doodle */}
</button>
```
Nothing else. Whatever you pass as `art` gets pinned bottom-right,
slightly overflowing the card edge (that overflow is intentional — it's
what makes it feel illustrated rather than boxed-in), and gets a small
scale+rotate "pop" automatically when the card becomes selected.

## The props
```ts
interface OptionCardProps {
  selected: boolean;              // is this the chosen option?
  onSelect: () => void;           // what happens on click
  title: string;                  // always required
  description?: string;           // optional supporting line
  icon?: React.ReactNode;         // optional small icon/emoji in the body
  art?: React.ReactNode;          // optional bottom-right doodle
  variant?: "default" | "compact" | "ticket";
}
```

**Variant cheat sheet** — this is the only thing that changes card
"shape," and it's picked by how much room the option realistically
needs:
| variant | used for | art size | padding |
|---|---|---|---|
| `default` | mode cards, anything mid-sized, 2-4 options | 60px | 16px |
| `compact` | dense grids with many options (category, 10+) | 40px | 12px |
| `ticket` | 2 big side-by-side choices (free/paid) | 76px | 20px, taller |

## How to use it where it's already wired in
You don't need to touch anything to use the existing three — just look
at them as templates:

- **`fields/ModeCards.tsx`** — the reference example for a small, fixed
  list (3 items) where every item has its own dedicated art.
- **`fields/FreePaidToggle.tsx`** — the reference example for the
  `ticket` variant, and for a card selection that also reveals another
  field (the price input) conditionally based on which card is picked.
- **`steps/Step1Spark.tsx`** — the reference example for a *large* list
  (14 categories) using a **lookup map** (`CATEGORY_ART`) so you don't
  have to have art for every option before shipping — unmapped ones
  fall back to one generic doodle.

## Recipe: adding a brand-new card type
Say you want to add, for example, an "Audience size" card selector
(Small / Medium / Large) with its own doodles. Here's the exact
pattern to copy:

**1. Draw or place your SVGs as small components**, right in the new
file (or split out if you'll reuse them elsewhere):
```tsx
const SmallArt = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
    <circle cx="26" cy="26" r="10" stroke="#008AF7" strokeWidth="2.5" opacity="0.5" />
  </svg>
);
// ...MediumArt, LargeArt the same way
```
Keep them `stroke`-based, blue, ~0.5 opacity, no fill — that's the
house style all the other placeholder doodles use, so new ones sit
consistently next to old ones even before you swap in real illustrated
art.

**2. Build an options array**:
```tsx
const OPTIONS = [
  { value: "small", label: "Small", desc: "Under 50 people", art: <SmallArt /> },
  { value: "medium", label: "Medium", desc: "50–300 people", art: <MediumArt /> },
  { value: "large", label: "Large", desc: "300+ people", art: <LargeArt /> },
];
```

**3. Map it through `OptionCard`** inside a `.cew-card-grid` (or
`.cew-toggle-grid` if there are only 2 and you want them big):
```tsx
import OptionCard from "../fields/OptionCard";

const AudienceSizeCards = ({ value, onChange }) => (
  <div className="field">
    <label>Expected audience size</label>
    <div className="cew-card-grid">
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.value}
          selected={value === opt.value}
          title={opt.label}
          description={opt.desc}
          art={opt.art}
          onSelect={() => onChange(opt.value)}
        />
      ))}
    </div>
  </div>
);
export default AudienceSizeCards;
```

**4. Drop it into whichever step makes sense** the same way
`ModeCards` is used inside `Step2TimePlace.tsx` — import it, render it,
wire its `onChange` to `onUpdate({ ...})` on the draft.

That's the whole recipe — steps 1–2 are the only "creative" part
(drawing the doodle, deciding the copy); steps 3–4 are copy-paste every
time.

## Swapping a placeholder for real illustrated art later
Every `art` prop right now holds a small inline `<svg>`. When you have
real doodle assets, you have two options, both drop-in replacements —
nothing about `OptionCard` or the CSS needs to change either way:

```tsx
// Option A — still inline SVG, just your real artwork's markup
const PaidCardArt = () => ( <svg>...(your real illustration paths)...</svg> );

// Option B — an image asset instead
import Image from "next/image";
const PaidCardArt = () => (
  <Image src="/doodles/coin.svg" alt="" width={76} height={76} />
);
```
Either way, `art={<PaidCardArt />}` in the options array is unchanged.

## Quick reference — where things live
```
fields/
  OptionCard.tsx        ← the primitive (edit here to change ALL cards' behavior)
  ModeCards.tsx          ← example: small fixed list, one art per item
  FreePaidToggle.tsx     ← example: 2-item "ticket" variant + conditional field
steps/
  Step1Spark.tsx         ← example: large list, lookup-map art with fallback
styles/
  create-event-wizard.css
    .cew-option-card             ← base card look
    .cew-option-card--compact    ← dense-grid sizing
    .cew-option-card--ticket     ← big 2-up sizing
    .cew-card-art                ← the bottom-right art slot itself
    .cew-card-grid / .cew-toggle-grid ← the two grid layouts cards sit in
```
