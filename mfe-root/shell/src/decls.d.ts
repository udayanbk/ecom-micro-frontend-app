declare module 'auth/mount' {
  export function mount(
    el: HTMLElement,
    options?: {
      onSuccess?: (token: string) => void;
    }
  ): () => void;
}

// declare module 'products/mount' {
//   export function mount(
//     el: HTMLElement,
//     options?: {
//       onAddToCart?: (item: {
//         productId: string;
//         name: string;
//         price: number;
//       }) => void;
//       // canAddToCart?: boolean;
//     }
//   ): () => void;
// }

declare module 'products/mount' {
  export function mount(
    el: HTMLElement,
    options?: {
      onAddToCart?: (productId: string) => void;
    }
  ): () => void;
}

