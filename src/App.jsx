import { useEffect, useState } from "react";
import { Calendar, BarChart3, Bell, Users, CalendarClock, Users2, FileText } from "lucide-react";
import { getSesion, cerrarSesion } from "./lib/auth";
import Login from "./components/Login";
import Header from "./components/Header";
import ProfesorView from "./components/ProfesorView";
import PreceptorView from "./components/PreceptorView";
import EstadoDelDia from "./components/EstadoDelDia";
import Estadisticas from "./components/Estadisticas";
import Alertas from "./components/Alertas";
import GestionUsuarios from "./components/GestionUsuarios";
import GestionCursos from "./components/GestionCursos";
import GestionAlumnos from "./components/GestionAlumnos";
import Reportes from "./components/Reportes";
import { TabBtn } from "./components/AttendanceUI";

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [listo, setListo] = useState(false);
  const [tab, setTab] = useState("hoy");

  useEffect(() => {
    setSesion(getSesion());
    setListo(true);
  }, []);

  function salir() {
    cerrarSesion();
    setSesion(null);
    setTab("hoy");
  }

  if (!listo) return null;

  if (!sesion) {
    return <Login onLogin={setSesion} />;
  }

  const esSuperusuario = sesion.rol === "rector" || sesion.rol === "directivo";
  const gradoPreceptor = sesion.rol === "preceptor" ? sesion.grados?.[0] || null : null;

  return (
    <div className="min-h-screen bg-tiza print:bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Header
          rol={sesion.rol}
          nombre={sesion.nombre}
          subtitulo={gradoPreceptor ? `${gradoPreceptor}° año` : null}
          onSalir={salir}
        />

        {sesion.rol === "profesor" && (
          <ProfesorView grados={sesion.grados} genero={sesion.genero} userId={sesion.id} />
        )}

        {sesion.rol === "preceptor" && <PreceptorView grado={gradoPreceptor} />}

        {esSuperusuario && (
          <>
            <div className="flex gap-1.5 mb-6 bg-white border border-borde rounded-xl p-1 w-fit flex-wrap print:hidden">
              <TabBtn active={tab === "hoy"} onClick={() => setTab("hoy")} icon={Calendar}>
                Estado del día
              </TabBtn>
              <TabBtn active={tab === "stats"} onClick={() => setTab("stats")} icon={BarChart3}>
                Estadísticas
              </TabBtn>
              <TabBtn active={tab === "alertas"} onClick={() => setTab("alertas")} icon={Bell}>
                Alertas
              </TabBtn>
              <TabBtn active={tab === "reportes"} onClick={() => setTab("reportes")} icon={FileText}>
                Reportes
              </TabBtn>
              <TabBtn active={tab === "cursos"} onClick={() => setTab("cursos")} icon={CalendarClock}>
                Cursos
              </TabBtn>
              <TabBtn active={tab === "alumnos"} onClick={() => setTab("alumnos")} icon={Users2}>
                Alumnos
              </TabBtn>
              <TabBtn active={tab === "usuarios"} onClick={() => setTab("usuarios")} icon={Users}>
                Usuarios
              </TabBtn>
            </div>

            {tab === "hoy" && <EstadoDelDia userId={sesion.id} />}
            {tab === "stats" && <Estadisticas />}
            {tab === "alertas" && <Alertas />}
            {tab === "reportes" && <Reportes />}
            {tab === "cursos" && <GestionCursos />}
            {tab === "alumnos" && <GestionAlumnos />}
            {tab === "usuarios" && <GestionUsuarios miId={sesion.id} miUsuario={sesion.usuario} />}
          </>
        )}

        <div className="text-center text-xs text-texto3 mt-10 print:hidden">
          Desarrollado por Prof. Maidán Marcos Exequiel
        </div>
      </div>
    </div>
  );
}
