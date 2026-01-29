import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import MFEErrorBoundary from "./MFEErrorBoundary";
import { MFEContainer } from "./MFEContainer";
import { Cart, EMPTY_CART } from "../cart.types";
import CartPage from "./CartPage";

const API_URL = process.env.REACT_APP_API_URL;


export const ShellRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken"),
  );
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  /* ---------- Fetch Cart ---------- */
  const fetchCart = async () => {
    if (!token) {
      setCart(EMPTY_CART);
      return;
    }

    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const data = await res.json();
    setCart({ items: data?.items ?? [] });
  };

  /* ---------- Session Restore ---------- */
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");

    if (!storedToken) {
      setAuthReady(true); // auth resolved (unauthenticated)
      setCheckingSession(false);
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          setToken(null);
        } else if (res.ok) {
          setToken(storedToken);
        }
      })
      .finally(() => {
        setAuthReady(true); // auth resolved (authenticated)
        setCheckingSession(false);
      });
  }, []);

  /* ---------- Load Cart on Login ---------- */
  useEffect(() => {
    fetchCart();
  }, [token]);

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (checkingSession) return;

    if (!token && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }

    if (!checkingSession && token && location.pathname === "/login") {
      navigate("/products", { replace: true });
    }
  }, [token, checkingSession, location.pathname]);

  /* ---------- Add to Cart ---------- */
  const addToCart = async (productId: string) => {
    if (!token) return;

    const res = await fetch(`${API_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!res.ok) return;

    await fetchCart();
  };

  /* ---------- Checkout ---------- */
  const checkout = async () => {
    if (!token) return;

    const res = await fetch(`${API_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    await fetchCart();
    navigate("/products");
  };

  /* ---------- Logout ---------- */
  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setCart(EMPTY_CART);
    // navigate("/login");
  };

  /* ---------- MFE Mounts ---------- */
  const mountAuth = useCallback(
    (el: HTMLElement) => {
      let cleanup: (() => void) | undefined;
      let cancelled = false;

      import("auth/mount").then(({ mount }) => {
        if (cancelled) return;

        cleanup = mount(el, {
          onSuccess: (token: string) => {
            localStorage.setItem("accessToken", token);
            setToken(token);
            // navigate("/products");
          },
        });
      });

      return () => {
        cancelled = true;
        cleanup?.();
      };
    },
    [navigate],
  );

  const mountProducts = useCallback(
    (el: HTMLElement) => {
      let cleanup: (() => void) | undefined;
      let cancelled = false;

      import("products/mount")
        .then(({ mount }) => {
          if (cancelled) return;

          cleanup = mount(el, {
            onAddToCart: addToCart,
          });
        })
        .catch((err) => {
          console.error("Products MFE failed to load", err);
          if (!cancelled) {
            const root = createRoot(el);
            root.render(
              <div style={{ padding: 24, color: "#b91c1c" }}>
                <h3>Products service unavailable</h3>
                <p>Please start the Products MFE</p>
              </div>,
            );
          }
        });

      return () => {
        cancelled = true;
        cleanup?.();
      };
    },
    [addToCart], // keep fresh reference
  );

  if (checkingSession) {
    return <p style={{ padding: 24 }}>Checking session…</p>;
  }

  return (
    <>
      <Header
        isAuthenticated={!!token}
        cartCount={cart.items.reduce((a, b) => a + b.quantity, 0)}
        onCart={() => navigate("/cart")}
        onLogin={() => navigate("/login")}
        onLogout={logout}
      />

      <Routes>
        <Route
          path="/login"
          element={
            <MFEErrorBoundary name="Auth App">
              <MFEContainer mount={mountAuth} />
            </MFEErrorBoundary>
          }
        />

        <Route
          path="/products"
          element={
            !authReady ? (
              <p style={{ padding: 24 }}>Preparing products…</p>
            ) : (
              <MFEErrorBoundary name="Products App">
                <MFEContainer
                  key={`products-${token}`} // FORCE REMOUNT
                  mount={mountProducts}
                />
              </MFEErrorBoundary>
            )
          }
        />

        <Route
          path="/cart"
          element={
            <MFEErrorBoundary name="Cart Page">
              <CartPage cart={cart} onCheckout={checkout} />
            </MFEErrorBoundary>
          }
        />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </>
  );
};