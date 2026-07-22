import { useState } from "react";
import { loginUsuario } from "../lib/auth";
import { LOGO_B64 } from "../lib/logo";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!usuario.trim() || !clave) {
      setError("Completá usuario y contraseña.");
      return;
    }
    setCargando(true);
    const sesion = await loginUsuario(usuario, clave);
    setCargando(false);
    if (!sesion) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    onLogin(sesion);
  }

  return (
    <div className="min-h-screen bg-tiza flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src={LOGO_B64}
            alt="Escudo del Instituto San José"
            className="w-24 h-auto mx-auto mb-4"
          />
          <div className="font-display tracking-wide text-azul text-5xl mb-1 leading-tight">
            Instituto San José
          </div>
          <div className="text-xs text-texto3 tracking-widest uppercase mb-2">
            Quines — San Luis
          </div>
          <p className="text-texto2 text-[15px] m-0">Planilla de Educación Física · Iniciá sesión</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-borde rounded-2xl p-6">
          <label className="block text-xs font-medium text-texto2 mb-1.5">Usuario</label>
          <input
            autoFocus
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="profe1 / preceptor / rector"
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 bg-white text-tinta mb-4 text-[15px]"
          />
          <label className="block text-xs font-medium text-texto2 mb-1.5">Contraseña</label>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="••••••••"
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 bg-white text-tinta text-[15px]"
          />
          {error && <div className="text-rojo text-sm mt-2.5">{error}</div>}
          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-5 bg-bordo disabled:opacity-70 text-white font-semibold py-3 rounded-xl border-none text-[15px] cursor-pointer"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
