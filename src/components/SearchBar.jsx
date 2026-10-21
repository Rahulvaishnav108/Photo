import { memo } from "react";

// memo: skips re-rendering when its props are unchanged.
// That only works because Gallery passes a stable onChange (useCallback).
function SearchBar({ value, onChange }) {
  return (
    <label className="relative block w-full sm:max-w-sm">
      <span className="sr-only">Search photos by author</span>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search by author"
        autoComplete="off"
        className="inset-field w-full rounded-full py-3 pl-12 pr-5 text-[15px] text-white placeholder:text-white/50"
      />
    </label>
  );
}

export default memo(SearchBar);
