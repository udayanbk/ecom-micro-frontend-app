import React, { useState, useRef, useEffect } from "react";

type Props = {
  onSuccess: (token: string) => void;
};

const Login: React.FC<Props> = ({ onSuccess }) => {
  const googleRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: number;

    const initGoogle = () => {
      if (!window.google || !googleRef.current) return;

      window.google.accounts.id.initialize({
        client_id:
          "313537263794-f3382uoot6kijjh1ua3obunblooitem0.apps.googleusercontent.com",
        callback: async (response: any) => {
          const res = await fetch("http://localhost:4000/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          });

          const data = await res.json();
          onSuccess(data.accessToken);
        },
      });

      window.google.accounts.id.renderButton(googleRef.current, {
        theme: "filled_blue",
        size: "large",
        shape: "pill",
        width: 400,
      });

      clearInterval(interval);
    };

    interval = window.setInterval(initGoogle, 100);

    return () => clearInterval(interval);
  }, []);

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      onSuccess(data.accessToken);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-auto text-center flex flex-col items-center justify-center">
      <h3 className="text-3xl p-3 m-3">Welcome.. Let's Login</h3>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        // style={{ width: "100%", marginBottom:  }}
        className="w-[400px] border-2 border-blue-200 bg-orange-100 p-2 m-2 pl-5 rounded-3xl text-black"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        // style={{ width: "100%", marginBottom: 8 }}
        className="w-[400px] border-2 border-blue-200 bg-orange-100 p-2 m-2 pl-5 rounded-3xl text-black"
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={submit}
        disabled={loading}
        className="w-[400px] bg-blue-500 text-white px-4 p-2 m-3 rounded-3xl hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Logging in…" : "Login"}
      </button>
        <div ref={googleRef} />
    </div>
  );
};

export default Login;
