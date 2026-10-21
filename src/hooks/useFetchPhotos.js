import { useEffect, useState } from "react";

const API_URL = "https://picsum.photos/v2/list?limit=30";

// Fetches the photo list once on mount.
// Returns: { photos, loading, error }
export default function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // AbortController lets us cancel the request if the component unmounts
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(API_URL, { signal: controller.signal });
        // fetch() only rejects on network failure, so HTTP errors (404, 500) are checked by hand
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data = await res.json();
        setPhotos(data);
      } catch (err) {
        if (err.name === "AbortError") return; // cancelled on purpose, not a real failure
        setError(err.message || "Something went wrong");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return { photos, loading, error };
}
