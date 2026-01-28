import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Cart, CartItem, EMPTY_CART } from "./cart.types";
import Header from "./components/Header";
import CartPage from "./components/CartPage";

const API_URL = "http://localhost:4000";
const IDLE_TIMEOUT = 5 * 60 * 1000;

const MFEContainer: React.FC<{
  mount: (el: HTMLElement) => Promise<() => void> | (() => void);
}> = ({ mount }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const result = await mount(ref.current!);

      if (cancelled) return;
      cleanup = result;
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [mount]);

  return <div ref={ref} />;
};

/* ------------------------------------------
   SHELL ROUTES
------------------------------------------- */
const ShellRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tokenRef = useRef<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const idleTimer = useRef<number | null>(null);
  const [cart, setCart] = useState<Cart>(EMPTY_CART);

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken"),
  );
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  /* ---------- Idle Logout ---------- */
  const resetIdleTimer = () => {
    if (idleTimer.current) {
      window.clearTimeout(idleTimer.current);
    }

    idleTimer.current = window.setTimeout(() => {
      logout();
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    if (!token) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    const handler = () => resetIdleTimer();

    events.forEach((e) => window.addEventListener(e, handler));
    resetIdleTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
      }
    };
  }, [token]);

  const getCartData = async () => {
    const currentToken = tokenRef.current;
    console.log("Fetching cart data with token:", currentToken);

    if (!currentToken) {
      setCart(EMPTY_CART);
      return;
    }

    const res = await fetch("http://localhost:4000/cart", {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (!res.ok) {
      console.warn("Failed to fetch cart");
      return;
    }

    const data = await res.json();
    setCart({ items: data?.items ?? [] });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");

    if (!storedToken) {
      setCheckingSession(false);
      setAuthReady(false);
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (res.status === 401) {
          console.warn("Token expired → logging out");
          // localStorage.removeItem("accessToken");
          // setToken(null);
          // setAuthReady(false);
          logout();
          return;
        } else if (res.ok) {
          setToken(storedToken);
          setAuthReady(true);
        }
      })
      .catch(() => {
        setAuthReady(true);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!token) {
      setCart(EMPTY_CART);
      return;
    }

    getCartData();
  }, [token]);

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (checkingSession) return;

    if (!token && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }

    if (token && location.pathname === "/login") {
      navigate("/products", { replace: true });
    }
  }, [token, checkingSession, location.pathname]);

  const addToCart = async (item: { productId: string }) => {
    if (!authReady || !token) {
      console.warn("Auth not ready, ignoring add to cart");
      return;
    }

    const res = await fetch("http://localhost:4000/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: item.productId }),
    });

    if (!res.ok) {
      console.error("Add to cart failed");
      return;
    }

    await getCartData();
  };

  /* ---------- Logout ---------- */
  const logout = () => {
    localStorage.removeItem("accessToken");
    // localStorage.removeItem("cart"); // 🧹 clear cart
    // setCart({ items: [] }); // reset state
    setToken(null);
    navigate("/login");
  };

  /* ---------- MFE Mounts (MEMOIZED) ---------- */
  const mountAuth = useCallback(
    async (el: HTMLElement) => {
      const { mount } = await import("auth/mount");

      return mount(el, {
        onSuccess: (token: string) => {
          localStorage.setItem("accessToken", token);
          setToken(token);
          setAuthReady(true);
          navigate("/products");
        },
      });
    },
    [navigate],
  );

const mountProducts = useCallback(async (el: HTMLElement) => {
  const { mount } = await import("products/mount");

  return mount(el, {
    onAddToCart: async (productId: string) => {
      const currentToken = tokenRef.current;
      if (!currentToken) return;

      const res = await fetch("http://localhost:4000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        console.error("Add to cart failed");
        return;
      }
      const updatedProduct = await res.json();
      await getCartData();
      return updatedProduct;
    },
  });
}, []);


  if (checkingSession) {
    return <p style={{ padding: 24 }}>Checking session…</p>;
  }

  const checkout = async () => {
    if (!token) {
      console.warn("Checkout blocked: no token");
      return;
    }

    const res = await fetch("http://localhost:4000/orders/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Checkout response status:", res);

    if (!res.ok) {
      console.error("Checkout failed");
      return;
    }

    await getCartData();
    navigate("/products");
  };

  return (
    <>
      <Header
        isAuthenticated={!!token}
        cartCount={cart?.items?.reduce((a, b) => a + b.quantity, 0) ?? 0}
        onCart={() => navigate("/cart")}
        onLogin={() => navigate("/login")}
        onLogout={logout}
      />

      <Routes>
        <Route path="/login" element={<MFEContainer mount={mountAuth} />} />

        <Route
          path="/products"
          element={<MFEContainer mount={mountProducts} />}
        />

        <Route
          path="/cart"
          element={<CartPage cart={cart} onCheckout={checkout} />}
        />

        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </>
  );
};

/* ------------------------------------------
   APP ROOT
------------------------------------------- */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ShellRoutes />
    </BrowserRouter>
  );
};

export default App;
