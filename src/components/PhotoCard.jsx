import { memo, useRef } from "react";

function PhotoCard({ photo, isFavourite, onToggle }) {
  const cardRef = useRef(null);

  // Tilt toward the pointer by writing CSS variables directly,
  // so moving the mouse never triggers a React re-render.
  const handlePointerMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="tilt-card glass rounded-[28px] p-3"
    >
      <div className="photo-well relative aspect-[4/3] overflow-hidden rounded-[18px]">
        <img
          src={`https://picsum.photos/id/${photo.id}/640/480`}
          alt={`Photo by ${photo.author}`}
          loading="lazy"
          draggable="false"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
        <p className="min-w-0 truncate text-[15px] font-semibold text-white">
          {photo.author}
        </p>
        <button
          type="button"
          onClick={() => onToggle(photo.id)}
          aria-pressed={isFavourite}
          aria-label={
            isFavourite
              ? `Remove ${photo.author}'s photo from favourites`
              : `Add ${photo.author}'s photo to favourites`
          }
          className={`orb-button ${isFavourite ? "is-active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="heart h-5 w-5"
            fill={isFavourite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.8 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.4 3.3 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" />
          </svg>
        </button>
      </div>
    </article>
  );
}

// memo: toggling one heart re-renders only that card, not all 30
export default memo(PhotoCard);
