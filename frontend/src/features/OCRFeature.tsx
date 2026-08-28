import React, { useState } from 'react';
import { ScanLine, UploadCloud, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export const OCRFeature: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedData(null);
    }
  };

  const handleSimulateOCR = () => {
    if (!selectedFile) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setExtractedData({
        nombres: 'JUAN CARLOS',
        apellido_paterno: 'MAMANI',
        apellido_materno: 'PEREZ',
        fecha_nacimiento: '2015-03-20',
        fecha_bautismo: '2021-06-12',
        numero_libro: 1,
        numero_folio: 1,
        numero_partida: 1,
        confianza: 94.5,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          DIGITALIZACIÓN Y RECONOCIMIENTO ÓPTICO CON IA (OCR)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sube la fotografía o escaneo de un libro histórico manuscrito. El motor de IA extraerá automáticamente los datos para revisión humana.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            CARGAR IMAGEN DEL LIBRO HISTÓRICO
          </h3>

          <div className="border-2 border-dashed border-blue-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-8 text-center transition-all bg-blue-50/40 dark:bg-slate-800/40">
            {previewUrl ? (
              <div className="space-y-3">
                <img src={previewUrl} alt="Escaneo Libro" className="max-h-56 mx-auto rounded-2xl shadow-md" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{selectedFile?.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-12 h-12 text-blue-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  HAZ CLIC O ARRASTRA LA FOTO DE LA PÁGINA DEL LIBRO AQUÍ
                </p>
                <p className="text-[10px] text-slate-400">FORMATOS SOPORTADOS: PNG, JPG, JPEG (MÁX 10MB)</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-block px-5 py-2 rounded-xl bg-blue-100 dark:bg-slate-800 hover:bg-blue-200 text-blue-900 dark:text-slate-200 text-xs font-black uppercase cursor-pointer transition-colors"
            >
              SELECCIONAR ARCHIVO
            </label>
          </div>

          {selectedFile && !extractedData && (
            <button
              onClick={handleSimulateOCR}
              disabled={processing}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? (
                <span>PROCESANDO IMAGEN CON MODELO DE IA...</span>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  <span>EJECUTAR EXTRACCIÓN DE IA / OCR</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* OCR Extracted Panel (Human in the Loop) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            DATOS EXTRAÍDOS (REVISIÓN DE REVISOR HUMANO)
          </h3>

          {!extractedData ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold uppercase border border-blue-50 dark:border-slate-800 rounded-2xl">
              Carga una imagen y presiona "Ejecutar Extracción" para visualizar los campos detectados.
            </div>
          ) : (
            <div className="space-y-3 uppercase font-semibold text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-2 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  CONFIANZA DEL MODELO IA: {extractedData.confianza}%
                </span>
                <span className="text-[10px] font-bold">ALTA PRECISIÓN</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block font-extrabold">NOMBRES DETECTADOS</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{extractedData.nombres}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block font-extrabold">APELLIDO PATERNO</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{extractedData.apellido_paterno}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block font-extrabold">LIBRO N°</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{extractedData.numero_libro}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block font-extrabold">FOLIO N°</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{extractedData.numero_folio}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block font-extrabold">PARTIDA N°</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{extractedData.numero_partida}</p>
                </div>
              </div>

              <button
                onClick={() => alert('¡Partida confirmada e ingresada exitosamente a la base de datos PostgreSQL!')}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <span>APROBAR Y GUARDAR PARTIDA OFICIAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
