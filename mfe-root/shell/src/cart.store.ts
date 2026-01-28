import { Cart } from './cart.types';

const CART_KEY = 'local_cart';

export function loadCart(): Cart {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '{"items": []}');
  } catch {
    return { items: [] };
  }
}

export function saveCart(cart: Cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
