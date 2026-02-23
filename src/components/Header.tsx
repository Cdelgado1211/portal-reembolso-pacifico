export const Header = () => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <img
            src="https://images.email-platform.com/venturestars/pacificosalud.png"
            alt="Pacífico Salud"
            className="h-14 w-auto md:h-16"
            loading="eager"
            decoding="async"
          />
          <div>
            <h1 className="text-base font-bold text-slate-800 md:text-lg">Preregistro de Reembolso</h1>
          </div>
        </div>
      </div>
    </header>
  );
};
