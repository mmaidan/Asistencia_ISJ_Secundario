import { useEffect, useState } from "react";
import { UserPlus, KeyRound, Trash2, Users } from "lucide-react";
import { GRADOS } from "../lib/data";
import {
  listarUsuarios,
  crearUsuario,
  actualizarGrados,
  resetearClave,
  eliminarUsuario,
} from "../lib/usuariosApi";

const ROL_LABEL = { profesor: "Profesor", preceptor: "Preceptor", rector: "Rector" };

export default function GestionUsuarios({ miId }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function recargar() {
    setCargando(true);
    try {
      setUsuarios(await listarUsuarios());
    } catch (e) {
      setError("No se pudo cargar la lista de usuarios.");
    }
    setCargando(false);
  }

  useEffect(() => {
    recargar();
  }, []);

  return (
    <div>
      <NuevoUsuario onCreado={recargar} setError={setError} />

      {error && <div className="text-rojo text-sm mb-4">{error}</div>}

      <div className="flex items-center gap-2 mb-3 text-tinta font-semibold">
        <Users size={18} /> Usuarios existentes
      </div>

      {cargando ? (
        <div className="text-center py-8 text-texto2">Cargando usuarios...</div>
      ) : (
        <div className="grid gap-3">
          {usuarios.map((u) => (
            <FilaUsuario
              key={u.id}
              usuario={u}
              esUno={u.id === miId}
              onCambio={recargar}
              setError={setError}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NuevoUsuario({ onCreado, setError }) {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState("profesor");
  const [grados, setGrados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  function toggleGrado(g) {
    setGrados((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g].sort()));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !usuario.trim() || !clave) {
      setError("Completá nombre, usuario y contraseña.");
      return;
    }
    setGuardando(true);
    try {
      await crearUsuario({ usuario, clave, nombre, rol, grados });
      setNombre("");
      setUsuario("");
      setClave("");
      setGrados([]);
      onCreado();
    } catch (e) {
      setError(
        e?.message?.includes("duplicate") || e?.code === "23505"
          ? "Ese nombre de usuario ya existe."
          : "No se pudo crear el usuario."
      );
    }
    setGuardando(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-borde rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4 text-tinta font-semibold">
        <UserPlus size={18} /> Dar de alta un usuario
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-texto2 mb-1.5">Nombre y apellido</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Prof. Ana Gómez"
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-texto2 mb-1.5">Rol</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta"
          >
            <option value="profesor">Profesor de Educación Física</option>
            <option value="preceptor">Preceptor</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-texto2 mb-1.5">Usuario</label>
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="profe4"
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-texto2 mb-1.5">Contraseña</label>
          <input
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Elegí una contraseña"
            className="w-full box-border border border-borde rounded-lg px-3 py-2.5 text-tinta"
          />
        </div>
      </div>

      {rol === "profesor" && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-texto2 mb-2">Cursos a cargo (por año)</label>
          <div className="flex flex-wrap gap-2">
            {GRADOS.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => toggleGrado(g)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  grados.includes(g) ? "bg-azul text-white border-azul" : "bg-transparent text-texto2 border-borde"
                }`}
              >
                {g}°
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="bg-bordo disabled:opacity-70 text-white font-semibold px-5 py-2.5 rounded-xl border-none text-sm cursor-pointer"
      >
        {guardando ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}

function FilaUsuario({ usuario, esUno, onCambio, setError }) {
  const [grados, setGrados] = useState(usuario.grados || []);
  const [editandoClave, setEditandoClave] = useState(false);
  const [nuevaClave, setNuevaClave] = useState("");
  const [ocupado, setOcupado] = useState(false);

  function toggleGrado(g) {
    setGrados((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g].sort()));
  }

  async function guardarGrados() {
    setOcupado(true);
    try {
      await actualizarGrados(usuario.id, grados);
      onCambio();
    } catch (e) {
      setError("No se pudieron actualizar los cursos.");
    }
    setOcupado(false);
  }

  async function guardarClave() {
    if (!nuevaClave) return;
    setOcupado(true);
    try {
      await resetearClave(usuario.id, nuevaClave);
      setEditandoClave(false);
      setNuevaClave("");
    } catch (e) {
      setError("No se pudo cambiar la contraseña.");
    }
    setOcupado(false);
  }

  async function borrar() {
    if (!confirm(`¿Borrar el usuario "${usuario.usuario}"? Esta acción no se puede deshacer.`)) return;
    setOcupado(true);
    try {
      await eliminarUsuario(usuario.id);
      onCambio();
    } catch (e) {
      setError("No se pudo borrar el usuario.");
    }
    setOcupado(false);
  }

  return (
    <div className="bg-white border border-borde rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <div>
          <div className="font-semibold text-tinta">
            {usuario.nombre} {esUno && <span className="text-xs text-texto3">(vos)</span>}
          </div>
          <div className="text-xs text-texto2">
            @{usuario.usuario} · {ROL_LABEL[usuario.rol]}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditandoClave((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-azul bg-azul-claro px-3 py-1.5 rounded-full border-none cursor-pointer"
          >
            <KeyRound size={13} /> Cambiar clave
          </button>
          {!esUno && (
            <button
              onClick={borrar}
              disabled={ocupado}
              className="flex items-center gap-1 text-xs font-medium text-rojo bg-rojo-claro px-3 py-1.5 rounded-full border-none cursor-pointer"
            >
              <Trash2 size={13} /> Borrar
            </button>
          )}
        </div>
      </div>

      {editandoClave && (
        <div className="flex items-center gap-2 mt-2 mb-3">
          <input
            value={nuevaClave}
            onChange={(e) => setNuevaClave(e.target.value)}
            placeholder="Nueva contraseña"
            className="flex-1 box-border border border-borde rounded-lg px-3 py-2 text-sm text-tinta"
          />
          <button
            onClick={guardarClave}
            disabled={ocupado || !nuevaClave}
            className="bg-azul disabled:opacity-70 text-white text-sm font-medium px-3 py-2 rounded-lg border-none cursor-pointer"
          >
            Guardar
          </button>
        </div>
      )}

      {usuario.rol === "profesor" && (
        <div className="mt-2">
          <div className="text-xs text-texto2 mb-1.5">Cursos a cargo</div>
          <div className="flex flex-wrap gap-2 items-center">
            {GRADOS.map((g) => (
              <button
                key={g}
                onClick={() => toggleGrado(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  grados.includes(g) ? "bg-azul text-white border-azul" : "bg-transparent text-texto2 border-borde"
                }`}
              >
                {g}°
              </button>
            ))}
            {JSON.stringify(grados) !== JSON.stringify(usuario.grados || []) && (
              <button
                onClick={guardarGrados}
                disabled={ocupado}
                className="text-xs font-medium text-white bg-verde px-3 py-1 rounded-full border-none cursor-pointer"
              >
                Guardar cambios
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
