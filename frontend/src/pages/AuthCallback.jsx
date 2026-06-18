import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const session_id = params.get("session_id");

    if (!session_id) {
      navigate("/login");
      return;
    }

    api
      .post("/auth/session", { session_id })
      .then(({ data }) => {
        setUser(data.user);
        // clear hash
        window.history.replaceState(null, "", "/");
        navigate("/", { state: { user: data.user } });
      })
      .catch(() => navigate("/login"));
  }, [navigate, setUser]);

  return (
    <div className="section-pad text-center text-muted" data-testid="auth-callback-loading">
      Verificando sesión...
    </div>
  );
}
