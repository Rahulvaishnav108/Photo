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

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export default function Gallery() {
  const { photos, loading, error } = useFetchPhotos();
  const [query, setQuery] = useState("");
  const [hiddenIds, setHiddenIds] = useState(() => readStorage("lumina:hidden", []));
  const [edits, setEdits] = useState(() => readStorage("lumina:edits", {}));
  const [activePhoto, setActivePhoto] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [devicePhotos, setDevicePhotos] = useState([]);
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

  const handleDelete = (id) => {
    if (!window.confirm("Remove this photo from your gallery?")) return;
    const devicePhoto = devicePhotos.find((photo) => photo.id === id);
    if (devicePhoto) {
      URL.revokeObjectURL(devicePhoto.src);
      setDevicePhotos((current) => current.filter((photo) => photo.id !== id));
      return;
    }
    const next = [...hiddenIds, id]; setHiddenIds(next); localStorage.setItem("lumina:hidden", JSON.stringify(next));
    if (activePhoto?.id === id) setActivePhoto(null);
  };
  const handleDevicePhotos = (event) => {
    const selected = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    const added = selected.map((file) => ({
      id: `device-${crypto.randomUUID()}`,
      author: "From your device",
      title: file.name.replace(/\\.[^.]+$/, ""),
      src: URL.createObjectURL(file),
      isDevicePhoto: true,
    }));
    setDevicePhotos((current) => [...current, ...added]);
    event.target.value = "";
  };
  const saveEdit = (event) => {
    event.preventDefault();
    const next = { ...edits, [editingPhoto.id]: { author: editingPhoto.author, title: editingPhoto.title } };
    setEdits(next); localStorage.setItem("lumina:edits", JSON.stringify(next)); setEditingPhoto(null);
  };

  // useMemo: the filtered list is only recalculated when photos or query change,
  // not on every re-render (e.g. when a heart is toggled).
  const filteredPhotos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...photos, ...devicePhotos].filter((original) => {
      if (hiddenIds.includes(original.id)) return false;
      const p = { ...original, ...edits[original.id] };
      return !q || p.author.toLowerCase().includes(q) || (p.title || "").toLowerCase().includes(q);
    }).map((p) => ({ ...p, ...edits[p.id] }));
  }, [photos, devicePhotos, query, hiddenIds, edits]);

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
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <SearchBar value={query} onChange={handleSearch} />
          <label className="cursor-pointer rounded-full border border-white/25 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-white/20">
            Add photos
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleDevicePhotos} aria-label="Choose photos from your device" />
          </label>
        </div>
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
                  onOpen={setActivePhoto}
                  onEdit={setEditingPhoto}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
      {activePhoto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setActivePhoto(null)}>
        <button className="absolute right-5 top-4 text-4xl text-white" onClick={() => setActivePhoto(null)} aria-label="Close viewer">×</button>
        <button className="absolute left-4 text-4xl text-white" onClick={(e) => { e.stopPropagation(); const i=filteredPhotos.findIndex(p=>p.id===activePhoto.id); setActivePhoto(filteredPhotos[(i-1+filteredPhotos.length)%filteredPhotos.length]); }} aria-label="Previous photo">‹</button>
        <figure className="max-h-full max-w-6xl text-center" onClick={(e) => e.stopPropagation()}>
          <img className="mx-auto max-h-[82vh] max-w-full rounded-xl object-contain" src={activePhoto.src || `https://picsum.photos/id/${activePhoto.id}/1600/1200`} alt={activePhoto.title || `Photo by ${activePhoto.author}`} />
          <figcaption className="mt-3 text-white">{activePhoto.title ? `${activePhoto.title} · ` : ""}{activePhoto.author}</figcaption>
        </figure>
        <button className="absolute right-4 text-4xl text-white" onClick={(e) => { e.stopPropagation(); const i=filteredPhotos.findIndex(p=>p.id===activePhoto.id); setActivePhoto(filteredPhotos[(i+1)%filteredPhotos.length]); }} aria-label="Next photo">›</button>
      </div>}
      {editingPhoto && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true"><form onSubmit={saveEdit} className="glass w-full max-w-md space-y-4 rounded-3xl p-6"><h2 className="text-xl font-semibold text-white">Edit photo details</h2><label className="block text-sm text-white/80">Photographer<input className="inset-field mt-1 w-full rounded-xl p-3 text-white" value={editingPhoto.author} onChange={e=>setEditingPhoto({...editingPhoto, author:e.target.value})} required /></label><label className="block text-sm text-white/80">Title<input className="inset-field mt-1 w-full rounded-xl p-3 text-white" value={editingPhoto.title || ""} onChange={e=>setEditingPhoto({...editingPhoto, title:e.target.value})} /></label><div className="flex justify-end gap-3"><button type="button" className="text-white/70" onClick={()=>setEditingPhoto(null)}>Cancel</button><button className="rounded-full bg-cyan-300 px-5 py-2 font-semibold text-slate-900">Save</button></div></form></div>}
    </>
  );
}
