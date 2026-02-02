import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { UploadCategory, UploadItem } from "../store/FlowContext";

const statusStyles: Record<string, string> = {
  pending: "bg-[rgba(201,198,194,0.4)] text-atlas-taupe-2",
  valid: "bg-[rgba(246,162,52,0.15)] text-atlas-orange",
  invalid: "bg-[rgba(206,63,27,0.15)] text-atlas-danger",
  validating: "bg-[rgba(158,147,136,0.3)] text-atlas-taupe-2"
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
    <div className="atlas-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="atlas-title text-lg">{title}</h3>
        <span className="text-xs font-semibold text-atlas-beige">
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
            ? "border-atlas-orange bg-[rgba(246,162,52,0.1)]"
            : "border-atlas-gray bg-atlas-white"
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
        <span className="font-semibold text-atlas-taupe-2">Arrastra y suelta aquí</span>
        <span className="text-xs text-atlas-beige">PDF, JPG o PNG</span>
        <button type="button" className="atlas-button-secondary mt-2">
          Seleccionar archivos
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {files.length === 0 && (
          <p className="text-xs text-atlas-beige">Aún no hay archivos cargados.</p>
        )}
        {files.map((file) => (
          <div key={file.id} className="rounded-lg border border-atlas-gray bg-white px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-atlas-navy">{file.name}</p>
                <p className="text-xs text-atlas-beige">{Math.ceil(file.size / 1024)} KB</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    statusStyles[file.status] ?? statusStyles.pending
                  }`}
                >
                  {file.status === "validating" ? "Validando..." :
                  file.status === "valid" ? "Válido" :
                  file.status === "invalid" ? "Inválido" : "Pendiente"}
                </span>
                {file.status === "validating" && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-atlas-beige border-t-transparent" />
                )}
                <button
                  type="button"
                  onClick={() => onRemove(category, file.id)}
                  className="text-xs font-semibold text-atlas-danger hover:underline"
                >
                  Quitar
                </button>
              </div>
            </div>
            {file.message && (
              <p className="mt-1 text-xs text-atlas-danger">{file.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropzone;
