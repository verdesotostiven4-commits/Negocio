"use client";

import { LockKeyhole, MonitorPlay } from "lucide-react";
import { FormEvent, useState } from "react";

export function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin })
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "No se pudo ingresar.");
      return;
    }
    window.location.reload();
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><MonitorPlay /><span>BARRIO <b>MAX</b> TV</span></div>
        <p>Panel privado para subir videos, organizar promociones, añadir música y publicar la programación de la TV.</p>
        <form onSubmit={submit}>
          <label>
            <span>PIN de administrador</span>
            <div><LockKeyhole /><input autoFocus inputMode="numeric" type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" /></div>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button disabled={busy || pin.length < 4}>{busy ? "Ingresando…" : "Entrar al panel"}</button>
        </form>
        <a href="/tv">Abrir pantalla de TV</a>
      </section>
    </main>
  );
}
