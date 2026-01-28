export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    createdAt: string;
  };
};

export type Cart = {
  items: CartItem[];
};

export const EMPTY_CART: Cart = {
  items: [],
};
