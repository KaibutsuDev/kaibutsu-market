import React from 'react';

export type SignageStyle = 'hanging' | 'neon' | 'canopy';

interface StoreSignageProps {
  isOpen: boolean;
  style?: SignageStyle | string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StoreSignage({
  isOpen,
  style = 'hanging',
  size = 'md',
}: StoreSignageProps) {
  const currentStyle: SignageStyle =
    style === 'neon' || style === 'canopy' || style === 'hanging' ? style : 'hanging';

  // ==========================================
  // ESTILO 1: CARTEL COLGANTE FACHADA VINTAGE
  // ==========================================
  if (currentStyle === 'hanging') {
    return (
      <div className="relative inline-flex flex-col items-center select-none group">
        {/* Cadenas superiores metálicas */}
        <div className="flex justify-between w-32 px-4 -mb-1 z-10">
          <div className="flex flex-col items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 ring-2 ring-neutral-300" />
            <span className="w-0.5 h-2 bg-neutral-400" />
            <span className="w-1 h-1 rounded-full bg-neutral-400" />
          </div>
          <div className="flex flex-col items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 ring-2 ring-neutral-300" />
            <span className="w-0.5 h-2 bg-neutral-400" />
            <span className="w-1 h-1 rounded-full bg-neutral-400" />
          </div>
        </div>

        {/* Tablón de Madera / Metal con remaches */}
        <div
          className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-2 transition-all duration-300 shadow-sm flex items-center gap-3 ${
            isOpen
              ? 'bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800 border-emerald-500/80 text-white shadow-emerald-700/20'
              : 'bg-linear-to-b from-neutral-700 via-neutral-800 to-neutral-900 border-neutral-600/70 text-neutral-300 shadow-neutral-900/30'
          }`}
        >
          {/* Remaches decorativos en esquinas */}
          <span className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-white/40 shadow-xs" />
          <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-white/40 shadow-xs" />
          <span className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-white/40 shadow-xs" />
          <span className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-white/40 shadow-xs" />

          {/* Icono de Campana / Candado */}
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
              isOpen
                ? 'bg-emerald-500/30 border-emerald-400/40 text-emerald-200'
                : 'bg-neutral-800/80 border-neutral-600/50 text-neutral-400'
            }`}
          >
            {isOpen ? (
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          {/* Textos grabados */}
          <div className="leading-tight">
            <span
              className={`block text-[9px] font-black uppercase tracking-widest ${
                isOpen ? 'text-emerald-200' : 'text-neutral-400'
              }`}
            >
              {isOpen ? '● Abierto al público' : '○ Cerrado por ahora'}
            </span>
            <span className="block text-xs sm:text-sm font-extrabold tracking-tight drop-shadow-xs">
              {isOpen ? '¡ATENDIENDO AHORA!' : 'VOLVEMOS PRONTO'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTILO 2: LETRERO NEÓN ABIERTO / CERRADO
  // ==========================================
  if (currentStyle === 'neon') {
    return (
      <div className="relative inline-flex items-center select-none">
        <div
          className={`relative px-4 py-2 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
            isOpen
              ? 'bg-neutral-950 border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
              : 'bg-neutral-950 border-neutral-800 shadow-[0_0_12px_rgba(0,0,0,0.5)]'
          }`}
        >
          {/* Tubo de Neón Circular indicador */}
          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
              </span>
            ) : (
              <span className="h-3 w-3 rounded-full bg-neutral-600 opacity-50"></span>
            )}
          </div>

          <div className="text-left font-mono">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] font-bold tracking-widest uppercase ${
                  isOpen ? 'text-emerald-400 drop-shadow-[0_0_6px_#10b981]' : 'text-neutral-500'
                }`}
              >
                OPEN SIGN
              </span>
            </div>
            <span
              className={`block text-xs sm:text-sm font-black tracking-wider uppercase transition-colors ${
                isOpen
                  ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse'
                  : 'text-neutral-500 line-through decoration-red-500/50'
              }`}
            >
              {isOpen ? 'ATENDIENDO AHORA' : 'CERRADO'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTILO 3: TOLDO DE ALMACÉN CON VITRINA
  // ==========================================
  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Toldo a Rayas (SVG) */}
      <div className="w-36 h-3.5 overflow-hidden -mb-0.5 z-10 drop-shadow-xs">
        <svg viewBox="0 0 144 14" className="w-full h-full" preserveAspectRatio="none">
          {/* Rayas verdes/rojas y blancas */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect
              key={i}
              x={i * 18}
              y="0"
              width="18"
              height="14"
              fill={
                i % 2 === 0
                  ? isOpen
                    ? '#059669' // emerald-600
                    : '#dc2626' // red-600
                  : '#ffffff'
              }
            />
          ))}
          {/* Sombra inferior del toldo festoneado */}
          <path
            d="M0,14 Q9,10 18,14 Q27,10 36,14 Q45,10 54,14 Q63,10 72,14 Q81,10 90,14 Q99,10 108,14 Q117,10 126,14 Q135,10 144,14"
            fill="none"
            stroke={isOpen ? '#047857' : '#b91c1c'}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Ventanilla del local */}
      <div
        className={`px-4 py-2 rounded-b-2xl border-x-2 border-b-2 transition-all duration-300 flex items-center gap-2.5 ${
          isOpen
            ? 'bg-amber-50/70 border-emerald-600/40 text-emerald-950 shadow-xs'
            : 'bg-neutral-100 border-neutral-300 text-neutral-600'
        }`}
      >
        <span className="text-base">{isOpen ? '🏪' : '🔒'}</span>
        <div className="leading-tight">
          <span
            className={`block text-[9px] font-black uppercase tracking-wider ${
              isOpen ? 'text-emerald-700' : 'text-neutral-500'
            }`}
          >
            {isOpen ? 'Ventanilla abierta' : 'Persiana abajo'}
          </span>
          <span className="block text-xs sm:text-sm font-bold text-neutral-900">
            {isOpen ? 'Atendiendo Ahora' : 'Cerrado por ahora'}
          </span>
        </div>
      </div>
    </div>
  );
}
