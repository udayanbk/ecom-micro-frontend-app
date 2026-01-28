import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Cart, EMPTY_CART } from "./cart.types";
import Header from "./components/Header";
import CartPage from "./components/CartPage";

const API_URL = "http://localhost:4000";

/* ------------------------------------------
   MFE CONTAINER
------------------------------------------- */
const MFEContainer: React.FC<{
  mount: (el: HTMLElement) => Promise<void | (() => void)> | void | (() => void);
}> = ({ mount }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let cleanup: void | (() => void);

    const result = mount(ref.current);

    Promise.resolve(result).then((fn) => {
      cleanup = fn;
    });

    return () => {
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
    setAuthReady(true);      // ✅ auth resolved (unauthenticated)
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
      setAuthReady(true);    // ✅ auth resolved (authenticated)
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

    if (token && location.pathname === "/login") {
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
    async (el: HTMLElement) => {
      const { mount } = await import("auth/mount");

      return mount(el, {
        onSuccess: (token: string) => {
          localStorage.setItem("accessToken", token);
          setToken(token);
          navigate("/products");
        },
      });
    },
    [navigate],
  );

  const mountProducts = useCallback(
    async (el: HTMLElement) => {
      const { mount } = await import("products/mount");

      return mount(el, {
        onAddToCart: addToCart,
      });
    },
    [],
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
      <MFEContainer
        key="auth"
        mount={mountAuth}
      />
    }
  />

  <Route
    path="/products"
    element={
      authReady ? (
        <MFEContainer mount={mountProducts} />
      ) : (
        <p style={{ padding: 24 }}>Preparing session…</p>
      )
    }
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
const App: React.FC = () => (
  <BrowserRouter>
    <ShellRoutes />
  </BrowserRouter>
);

export default App;
