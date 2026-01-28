import "./index.css";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./App";
import { Product } from "./types/product.types";

type MountOptions = {
  onAddToCart?: (productId: string) => Promise<Product | void>;
};

const roots = new WeakMap<HTMLElement, Root>();

export function mount(el: HTMLElement, options?: MountOptions) {
  let root = roots.get(el);

  if (!root) {
    root = createRoot(el);
    roots.set(el, root);
  }

  root.render(<App onAddToCart={options?.onAddToCart} />);

  return () => {
    // intentionally empty (shell controls lifecycle)
  };
}
