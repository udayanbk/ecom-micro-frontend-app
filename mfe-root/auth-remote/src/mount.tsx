import "./index.css";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import Login from "./Login";

type MountOptions = {
  onSuccess?: (token: string) => void;
};

const roots = new WeakMap<HTMLElement, Root>();

export function mount(el: HTMLElement, options?: MountOptions) {
  let root = roots.get(el);

  if (!root) {
    root = createRoot(el);
    roots.set(el, root);
  }

  root.render(
    <Login
      onSuccess={(token) => {
        options?.onSuccess?.(token);
      }}
    />,
  );

  // return () => {
  //   root?.unmount();
  //   roots.delete(el);
  // };
  return () => {
    queueMicrotask(() => {
      root?.unmount();
      roots.delete(el);
    });
  };
}
