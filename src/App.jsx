import { useEffect, useState } from "react";
import { Calendar, BarChart3, Bell, Users, CalendarClock, Users2 } from "lucide-react";
import { getSesion, cerrarSesion } from "./lib/auth";
import Login from "./components/Login";
import Header from "./components/Header";
import ProfesorView from "./components/ProfesorView";
import EstadoDelDia from "./components/EstadoDelDia";
import Estadisticas from "./components/Estadisticas";
import Alertas from "./components/Alertas";
import GestionUsuarios from "./components/GestionUsuarios";
import GestionCursos from "./components/GestionCursos";
import GestionAlumnos from "./components/GestionAlumnos";
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

  return (
    <div className="min-h-screen bg-tiza">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Header rol={sesion.rol} nombre={sesion.nombre} onSalir={salir} />

        {sesion.rol === "profesor" && <ProfesorView grados={sesion.grados} userId={sesion.id} />}

        {sesion.rol === "preceptor" && <EstadoDelDia />}

        {sesion.rol === "rector" && (
          <>
            <div className="flex gap-1.5 mb-6 bg-white border border-borde rounded-xl p-1 w-fit flex-wrap">
              <TabBtn active={tab === "hoy"} onClick={() => setTab("hoy")} icon={Calendar}>
                Estado del día
              </TabBtn>
              <TabBtn active={tab === "stats"} onClick={() => setTab("stats")} icon={BarChart3}>
                Estadísticas
              </TabBtn>
              <TabBtn active={tab === "alertas"} onClick={() => setTab("alertas")} icon={Bell}>
                Alertas
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

            {tab === "hoy" && <EstadoDelDia />}
            {tab === "stats" && <Estadisticas />}
            {tab === "alertas" && <Alertas />}
            {tab === "cursos" && <GestionCursos />}
            {tab === "alumnos" && <GestionAlumnos />}
            {tab === "usuarios" && <GestionUsuarios miId={sesion.id} />}
          </>
        )}
      </div>
    </div>
  );
}
