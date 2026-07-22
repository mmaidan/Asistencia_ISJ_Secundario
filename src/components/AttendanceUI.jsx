export function StatChip({ label, value, colorClass, bgClass }) {
  return (
    <div className={`flex-1 rounded-lg px-3 py-2 text-center ${bgClass}`}>
      <div className={`text-lg font-bold leading-none ${colorClass}`}>{value}</div>
      <div className="text-[11px] text-texto2 mt-1 font-body">{label}</div>
    </div>
  );
}

export function EstadoBtn({ active, onClick, colorClass, bgClass, borderClass, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
        active ? `${bgClass} ${colorClass} ${borderClass}` : "border-borde text-texto3 bg-transparent"
      }`}
    >
      <Icon size={17} />
    </button>
  );
}

export function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-azul text-white" : "text-texto2 bg-transparent"
      }`}
    >
      <Icon size={15} /> {children}
    </button>
  );
}

export function CursoEstadoCard({ curso, reg }) {
  const total = reg ? Object.keys(reg.estados).length : null;
  const estados = reg?.estados || null;
  const ausentes = estados ? Object.values(estados).filter((e) => e === "ausente").length : 0;
  const tarde = estados ? Object.values(estados).filter((e) => e === "tarde").length : 0;

  return (
    <div className="bg-white border border-borde rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold text-tinta">{curso.nombre}</div>
          <div className="text-xs text-texto2">{curso.dia} · {curso.horario}</div>
        </div>
        {reg ? (
          <div className="flex items-center gap-1.5 text-sm font-medium text-verde bg-verde-claro px-3 py-1 rounded-full">
            Tomada a las {reg.horaGuardado}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm font-medium text-dorado bg-dorado-claro px-3 py-1 rounded-full">
            Sin registrar
          </div>
        )}
      </div>
      {reg && (
        <div className="flex gap-4 mt-3 text-sm font-mono">
          <span className="text-texto2">
            <span className="text-tinta font-semibold">{total - ausentes}</span>/{total} presentes
          </span>
          {ausentes > 0 && <span className="text-rojo font-semibold">{ausentes} ausentes</span>}
          {tarde > 0 && <span className="text-dorado font-semibold">{tarde} tarde</span>}
        </div>
      )}
    </div>
  );
}
