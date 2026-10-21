import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import useFetchPhotos from "../hooks/useFetchPhotos";
import {
  favouritesReducer,
  initFavourites,
  STORAGE_KEY,
} from "../reducers/favouritesReducer";
import SearchBar from "./SearchBar";
import PhotoCard from "./PhotoCard";
import Spinner from "./Spinner";

export default function Gallery() {
  const { photos, loading, error } = useFetchPhotos();
  const [query, setQuery] = useState("");
  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    [],
    initFavourites
  );

  // Save favourites every time they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    } catch {
      /* storage full or blocked: the app still works, just without saving */
    }
  }, [favourites]);

  // useCallback: keeps the same function between renders, so the memoised
  // SearchBar is not re-rendered for no reason.
  const handleSearch = useCallback((e) => setQuery(e.target.value), []);

  const handleToggle = useCallback(
    (id) => dispatch({ type: "TOGGLE_FAVOURITE", id }),
    []
  );

  // useMemo: the filtered list is only recalculated when photos or query change,
  // not on every re-render (e.g. when a heart is toggled).
  const filteredPhotos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return photos;
    return photos.filter((p) => p.author.toLowerCase().includes(q));
  }, [photos, query]);

  return (
    <>
      <header className="glass sticky top-3 z-20 mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-[32px] px-5 py-4 sm:top-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3.5">
          <span className="logo-orb" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold leading-none tracking-tight text-white">
              Lumina
            </h1>
            <p className="mt-1 text-sm text-white/65">Photo gallery</p>
          </div>
        </div>
        <SearchBar value={query} onChange={handleSearch} />
      </header>

      <main className="mx-auto mt-8 w-full max-w-6xl pb-16">
        {loading && <Spinner />}

        {error && !loading && (
          <div
            role="alert"
            className="glass mx-auto mt-10 max-w-md rounded-[28px] p-8 text-center"
          >
            <h2 className="text-lg font-semibold text-white">
              Photos didn’t load
            </h2>
            <p className="mt-2 text-sm text-white/75">
              {error}. Check your connection and refresh the page.
            </p>
          </div>
        )}

        {!loading && !error && filteredPhotos.length === 0 && (
          <p className="py-20 text-center text-white/70">
            No photos by “{query.trim()}”. Try another author name.
          </p>
        )}

        {!loading && !error && filteredPhotos.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredPhotos.map((photo, i) => (
              <li
                key={photo.id}
                className="card-rise"
                style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}
              >
                <PhotoCard
                  photo={photo}
                  isFavourite={favourites.includes(photo.id)}
                  onToggle={handleToggle}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
