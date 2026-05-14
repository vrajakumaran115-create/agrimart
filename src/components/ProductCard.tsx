import { Link } from "react-router-dom";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="group bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <Link to={`/product/${product.id}`}>
        <div className="h-64 bg-neutral-100 overflow-hidden">
          <img
            src={product.image || "https://picsum.photos/seed/agrimart/600/600"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
      </Link>
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-black text-green-600">₹{product.price.toFixed(0)}</span>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="rounded-2xl bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 transition-all"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
