import { useState } from "react";
import { X, KeyRound } from "lucide-react";
import { cambiarMiClave } from "../lib/auth";

export default function CambiarMiClave({ usuarioId, onCerrar }) {
  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [claveNueva2, setClaveNueva2] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!claveActual || !claveNueva || !claveNueva2) {
      setError("Completá los tres campos.");
      return;
    }
    if (claveNueva.length < 4) {
      setError("La contraseña nueva es muy corta.");
      return;
    }
    if (claveNueva !== claveNueva2) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }

    setGuardando(true);
    try {
      await cambiarMiClave(usuarioId, claveActual, claveNueva);
      setExito(true);
    } catch (e) {
      setError(
        e?.message === "clave_incorrecta"
          ? "La contraseña actual no es correcta."
          : "No se pudo cambiar la contraseña. Probá de nuevo."
      );
    }
    setGuardando(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 sm:p-6 relative">
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-texto3 hover:text-tinta bg-transparent border-none cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4 text-tinta font-semibold">
          <KeyRound size={18} /> Cambiar mi contraseña
        </div>

        {exito ? (
          <div>
            <div className="text-verde text-sm mb-4">Listo, tu contraseña se actualizó.</div>
            <button
              onClick={onCerrar}
              className="bg-bordo text-white font-semibold px-5 py-2.5 rounded-xl border-none text-sm cursor-pointer w-full"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-medium text-texto2 mb-1.5">Contraseña actual</label>
            <input
              type="password"
              value={claveActual}
              onChange={(e) => setClaveActual(e.target.value)}
              className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta mb-3"
            />
            <label className="block text-xs font-medium text-texto2 mb-1.5">Contraseña nueva</label>
            <input
              type="password"
              value={claveNueva}
              onChange={(e) => setClaveNueva(e.target.value)}
              className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta mb-3"
            />
            <label className="block text-xs font-medium text-texto2 mb-1.5">Repetí la contraseña nueva</label>
            <input
              type="password"
              value={claveNueva2}
              onChange={(e) => setClaveNueva2(e.target.value)}
              className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta"
            />

            {error && <div className="text-rojo text-sm mt-3">{error}</div>}

            <button
              type="submit"
              disabled={guardando}
              className="w-full mt-5 bg-bordo disabled:opacity-70 text-white font-semibold py-2.5 rounded-xl border-none text-sm cursor-pointer"
            >
              {guardando ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
