import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl text-center space-y-6">
        <div className="text-6xl font-black text-green-600">404</div>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">Page not found</h1>
        <p className="text-neutral-500">The page you are looking for does not exist. Head back to the store to continue shopping.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all"
        >
          Back to Agrimart
        </Link>
      </div>
    </div>
  );
}
