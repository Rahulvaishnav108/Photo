export const STORAGE_KEY = "lumina:favourites";

// State is an array of favourited photo ids, e.g. ["3", "17"]
export function favouritesReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_FAVOURITE":
      return state.includes(action.id)
        ? state.filter((id) => id !== action.id)
        : [...state, action.id];
    default:
      return state;
  }
}

// Lazy initialiser: runs once, reads the saved favourites from localStorage
export function initFavourites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
