import React from "react";
import { Cart } from "../cart.types";

type Props = {
  cart: Cart;
  onCheckout: () => void;
};

const CartPage: React.FC<Props> = ({ cart, onCheckout }) => {
  console.log("Rendering CartPage with cart:", cart);
  const total = cart?.items?.reduce(
    (sum, item) => sum + item?.product?.price * item.quantity,
    0
  );

  if (cart?.items?.length === 0) {
    return <p className="p-6">Your cart is empty</p>;
  }

  return (
    <div className="w-[75%] p-6 mx-auto">
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>

      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li
            key={item.productId}
            className="flex justify-between border p-3 rounded"
          >
            <span>
              {item?.product?.name} × {item.quantity}
            </span>
            <span>₹ {item?.product?.price * item.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 font-semibold">
        Total: ₹ {total}
      </div>

      <button
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        onClick={onCheckout}
      >
        Checkout
      </button>
    </div>
  );
};

export default CartPage;
