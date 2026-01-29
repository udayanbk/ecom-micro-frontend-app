import React, { useEffect, useMemo, useState } from "react";
import { Product } from "./types/product.types";

const API_URL = process.env.REACT_APP_API_URL;

type Props = {
  onAddToCart?: (productId: string) => Promise<Product | void>;
};

type FilterType = "available" | "all";

const App: React.FC<Props> = ({ onAddToCart }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    let alive = true;

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error("Failed to fetch products");

        const data: Product[] = await res.json();
        if (alive) setAllProducts(data);
      } catch (err) {
        console.error(" Product fetch failed", err);
        if (alive) setAllProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      alive = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    if (filter === "available") {
      return allProducts.filter((p) => (p.inventory?.quantity ?? 0) > 0);
    }
    return allProducts;
  }, [filter, allProducts]);

  if (loading) {
    return <p className="p-6">Loading products…</p>;
  }

  return (
    <div className="w-[75%] p-6 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-blue-900">Products</h2>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="border-2 border-blue-200 bg-white px-4 py-2 pr-10 rounded-xl appearance-none"
          >
            <option value="available">Available items</option>
            <option value="all">All items</option>
          </select>

          {/* Custom arrow */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            ▼
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {visibleProducts.map((p) => (
          <div
            key={p.id}
            className="bg-yellow-200 border-2 border-red-200 min-h-[220px] flex flex-col rounded-xl p-2"
          >
            <strong className="text-center">{p.name}</strong>
            <p className="mt-2">₹ {p.price}</p>

            <div className="mt-auto flex justify-between items-end">
              <p>Stock: {p.inventory?.quantity ?? "N/A"}</p>

              {p.inventory && p.inventory.quantity > 0 && (
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                  onClick={() => onAddToCart?.(p.id)}
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        ))}

        {visibleProducts.length === 0 && (
          <p className="text-gray-500 col-span-full text-center">
            No products to display
          </p>
        )}
      </div>
    </div>
  );
};

export default App;
