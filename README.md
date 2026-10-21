# Lumina — Photo Gallery

React + Vite + Tailwind CSS photo gallery using the Picsum Photos API.

## Run

```bash
npm install
npm run dev
```

## What it does
- Fetches 30 photos on load (loading spinner + error message)
- Responsive grid: 4 columns desktop, 2 tablet, 1 mobile
- Real-time search by author (filters already-fetched data, no API call)
- Heart toggles favourites with `useReducer`, saved in `localStorage`
- `useFetchPhotos` custom hook returns `{ photos, loading, error }`
- `useCallback` on the search handler, `useMemo` on the filtered list

## File map
- `src/hooks/useFetchPhotos.js` – fetch logic
- `src/reducers/favouritesReducer.js` – reducer + localStorage initialiser
- `src/components/Gallery.jsx` – uses the hook, reducer, useCallback, useMemo
- `src/components/PhotoCard.jsx`, `SearchBar.jsx`, `Spinner.jsx`
- `src/index.css` – Tailwind import + glass / skeuomorphic styles

## Video talking points
1. **Hook**: returns photos, loading, error. On failure the catch sets `error`; `res.ok` is checked because fetch doesn't reject on 404/500. AbortController cancels on unmount.
2. **Reducer**: one action, `TOGGLE_FAVOURITE` (add id if missing, remove if present). Chosen over useState because the next state depends on the previous one and the logic lives in one testable function. Lazy init reads localStorage; a `useEffect` saves on every change.
3. **useCallback**: gives `handleSearch` a stable identity so memoised `SearchBar` doesn't re-render needlessly. Without it, a new function each render defeats `memo`.
4. **useMemo**: filtering only re-runs when `photos` or `query` change. Without it, it would re-run on every render, such as each heart toggle.
5. **Hard part** (pick your own): e.g. the tilt effect writes CSS variables directly instead of state, to avoid 30 cards re-rendering on every mouse move.
