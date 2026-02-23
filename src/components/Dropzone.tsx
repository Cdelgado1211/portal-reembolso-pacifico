import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { UploadCategory, UploadItem } from "../store/FlowContext";

const statusStyles: Record<string, string> = {
  pending: "bg-[rgba(201,198,194,0.4)] text-pacifico-taupe-2",
  valid: "bg-[#e7f7d9] text-[#4c9b2f]",
  invalid: "bg-[rgba(206,63,27,0.15)] text-pacifico-danger",
  validating: "bg-[rgba(158,147,136,0.3)] text-pacifico-taupe-2"
};

type DropzoneProps = {
  title: string;
  required?: boolean;
  category: UploadCategory;
  files: UploadItem[];
  onFilesAdded: (category: UploadCategory, files: FileList | File[]) => void;
  onRemove: (category: UploadCategory, id: string) => void;
};

const Dropzone = ({ title, required, category, files, onFilesAdded, onRemove }: DropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const allValid = files.length > 0 && files.every((file) => file.status === "valid");
  const hasInvalid = files.some((file) => file.status === "invalid");

  const handleFiles = (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    onFilesAdded(category, fileList);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleBrowse();
    }
  };

  return (
    <div className="pacifico-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="pacifico-title text-lg">{title}</h3>
        <span className="text-xs font-semibold text-pacifico-beige">
          {required ? "Requerido" : "Opcional"}
        </span>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Cargar archivos de ${title}`}
        onClick={handleBrowse}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-4 flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition ${
          isDragging
              ? "border-[#004b8d] bg-[rgba(0,75,141,0.06)]"
            : hasInvalid
              ? "border-[#e86a24] bg-[#fff7f4]"
              : allValid
                ? "border-[#61b433] bg-[#f8fff0]"
                : "border-pacifico-gray bg-pacifico-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              handleFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
        {allValid && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e7f7d9] px-4 py-2 text-xs font-semibold text-[#4c9b2f]">
            <span className="text-base leading-none">✔</span>
            <span>Todos los documentos de esta sección son válidos.</span>
          </div>
        )}
        {hasInvalid && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#ffe3db] px-4 py-2 text-xs font-semibold text-[#d8461f]">
            <span className="text-base leading-none">✕</span>
            <span>Hay documentos inválidos, revisa la lista inferior.</span>
          </div>
        )}
        <span className="font-semibold text-pacifico-taupe-2">Arrastra y suelta aquí</span>
        <span className="text-xs text-pacifico-beige">PDF, JPG o PNG</span>
        <button type="button" className="pacifico-button-secondary mt-2">
          Seleccionar archivos
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {files.length === 0 && (
          <p className="text-xs text-pacifico-beige">Aún no hay archivos cargados.</p>
        )}
        {files.map((file) => {
          const isInvalid = file.status === "invalid";
          return (
            <div
              key={file.id}
              className={`rounded-lg border px-3 py-2 ${
                isInvalid ? "border-[#e86a24] bg-[#fff3ec]" : "border-pacifico-gray bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${isInvalid ? "text-[#e86a24]" : "text-pacifico-navy"}`}>
                    {file.name}
                  </p>
                  <p className="text-xs text-pacifico-beige">{Math.ceil(file.size / 1024)} KB</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[file.status] ?? statusStyles.pending
                    }`}
                  >
                    {file.status === "validating"
                      ? "Validando..."
                      : file.status === "valid"
                        ? "Válido"
                        : file.status === "invalid"
                          ? "Documento inválido"
                          : "Pendiente"}
                  </span>
                  {file.status === "validating" && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-pacifico-beige border-t-transparent" />
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(category, file.id)}
                    className="text-xs font-semibold text-[#e86a24] hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              </div>
              {file.message && (
                <p
                  className={`mt-2 leading-relaxed ${
                    isInvalid
                      ? "text-sm font-semibold text-[#d8461f]"
                      : "text-xs text-pacifico-danger"
                  }`}
                >
                  {file.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dropzone;
