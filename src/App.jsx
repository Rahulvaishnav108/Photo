import Gallery from "./components/Gallery";

export default function App() {
  return (
    <div className="relative min-h-screen px-4 pt-3 sm:px-6 sm:pt-5">
      {/* Ambient light behind the glass */}
      <div className="aurora" aria-hidden="true">
        <span className="blob blob-violet" />
        <span className="blob blob-cyan" />
        <span className="blob blob-rose" />
      </div>
      <Gallery />
    </div>
  );
}
