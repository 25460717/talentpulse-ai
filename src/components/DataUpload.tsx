import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  Check, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { parseCSV } from '../csvHelper';
import { Employee } from '../types';
import { CSV_TEMPLATE_CONTENT } from '../sampleData';

interface DataUploadProps {
  onLoadSample: () => void;
  onDataLoaded: (employees: Employee[]) => void;
  totalLoaded: number;
}

export const DataUpload: React.FC<DataUploadProps> = ({
  onLoadSample,
  onDataLoaded,
  totalLoaded
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorStatus(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setErrorStatus('El archivo CSV no contiene registros válidos o las columnas requeridas.');
          return;
        }
        onDataLoaded(parsed);
        setUploadStatus(`¡Éxito! Se cargaron ${parsed.length} empleados correctamente.`);
        setTimeout(() => setUploadStatus(null), 4000);
      } catch (err) {
        setErrorStatus('Error al procesar el archivo CSV. Revisa el formato.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadCSVTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Fuente de Datos de Talento Humano
          </h3>
          <p className="text-xs text-slate-500">
            Actualmente procesando <strong className="text-indigo-600">{totalLoaded}</strong> empleados en el motor analítico.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* Descargar Plantilla */}
        <button
          onClick={downloadCSVTemplate}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
          title="Descarga la plantilla CSV con el esquema requerido"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar CSV de Ejemplo
        </button>

        {/* Subir archivo CSV propio */}
        <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-200 cursor-pointer">
          <UploadCloud className="w-4 h-4" />
          Cargar mi CSV
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Botón Cargar Dataset de Ejemplo */}
        <button
          onClick={onLoadSample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm shadow-indigo-600/30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Restablecer Dataset Ficticio (25 Empleados)
        </button>
      </div>

      {uploadStatus && (
        <div className="w-full text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          {uploadStatus}
        </div>
      )}

      {errorStatus && (
        <div className="w-full text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorStatus}
        </div>
      )}
    </div>
  );
};
