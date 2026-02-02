type HeaderProps = {
  onReset: () => void;
};

const Header = ({ onReset }: HeaderProps) => {
  return (
    <header className="bg-atlas-taupe text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src="https://www.segurosatlas.com.mx/content/dam/segurosatlas/corporativo-2025/iconos/logo-web2-blanco-final.png"
            alt="Seguros Atlas"
            className="h-16 w-auto"
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Portal de carga de documentos
            </p>
            <p className="text-xs text-white/70">Prerregistro de reembolso</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/90">
          <span>Línea Atlas 55 91775220</span>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-white/70 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Reiniciar demo
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
