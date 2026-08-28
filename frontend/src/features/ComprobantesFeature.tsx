import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FileText, Printer, Church, ShieldCheck } from 'lucide-react';
import type { CertificateRequest } from '../domain/types';
import { useActionAlert } from '../hooks/useActionAlert';
import ActionOverlay from '../components/common/ActionOverlay';
import TopAlert from '../components/common/TopAlert';

export const ComprobantesFeature: React.FC = () => {
  const [selectedCert] = useState<CertificateRequest>({
    id: 'CERT-2026-8901',
    tipo_sacramento: 'BAUTISMO',
    titular_nombre: 'JUAN CARLOS MAMANI PEREZ',
    fecha_emision: new Date().toISOString().split('T')[0],
    codigo_verificacion_qr: 'https://fidessystem.org/verify/CERT-2026-8901',
    firmado_por: 'PÁRROCO ALBERTO QUISPE FLORES',
    estado: 'EMITIDO',
  });

  const { isVisible, alertType, alertMessage, triggerAlert } = useActionAlert();

  const handlePrint = () => {
    triggerAlert('creado', 'IMPRIMIENDO CERTIFICADO OFICIAL CON CÓDIGO QR');
    window.print();
  };

  return (
    <div className="space-y-5">
      <ActionOverlay isVisible={isVisible} type={alertType} />
      <TopAlert show={isVisible} type={alertType} message={alertMessage} />

      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Emisión de Certificados Sacramentales con Código QR
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Certificados oficiales de Bautismo y Matrimonio autenticados por firma digital y QR verificado.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Certificado</span>
        </button>
      </div>

      {/* Official Certificate Paper Preview */}
      <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-6 text-slate-900 dark:text-slate-100 uppercase">
        {/* Certificate Watermark Header */}
        <div className="text-center border-b-2 border-blue-600 pb-4 space-y-1">
          <div className="inline-flex p-3 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 mb-2">
            <Church className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-blue-900 dark:text-blue-300">
            ARQUIDIÓCESIS DE LA PAZ — BOLIVIA
          </h1>
          <h2 className="text-sm font-bold text-blue-700 dark:text-blue-400">
            PARROQUIA SANTÍSIMA TRINIDAD
          </h2>
          <p className="text-[10px] font-semibold text-slate-500">
            SEDE PRINCIPAL — LA PAZ, BOLIVIA | TELÉFONO: 74185852
          </p>
        </div>

        {/* Certificate Title */}
        <div className="text-center py-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 underline decoration-blue-600 underline-offset-8">
            CERTIFICADO DE {selectedCert.tipo_sacramento}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            CÓDIGO OFICIAL: {selectedCert.id}
          </p>
        </div>

        {/* Certificate Body Text */}
        <div className="space-y-4 text-xs font-semibold leading-relaxed text-justify px-4">
          <p>
            EL SUSCRITO PÁRROCO DE LA PARROQUIA SANTÍSIMA TRINIDAD CERTIFICA EN FORMA LEGAL Y DE ACUERDO A LOS LIBROS SACRAMENTALES QUE SE CUSTODIAN EN EL ARCHIVO PARROQUIAL QUE:
          </p>

          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-800 space-y-2">
            <p className="text-sm font-black text-blue-700 dark:text-blue-400">
              TITULAR: {selectedCert.titular_nombre}
            </p>
            <p className="text-xs">LIBRO N°: 1 | FOLIO N°: 1 | PARTIDA N°: 1</p>
            <p className="text-xs">CELEBRADO EN: CAPILLA SANTÍSIMA TRINIDAD (SEDE)</p>
            <p className="text-xs">CELEBRANTE: {selectedCert.firmado_por}</p>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
            SE EXPIDE EL PRESENTE CERTIFICADO A SOLICITUD DE LA PARTE INTERESADA EN LA CIUDAD DE LA PAZ, A LOS {new Date().getDate()} DÍAS DEL MES DE AGOSTO DE {new Date().getFullYear()}.
          </p>
        </div>

        {/* Signature & QR Verification Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 items-center">
          {/* Dynamic QR Code */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
              <QRCodeSVG value={selectedCert.codigo_verificacion_qr} size={70} />
            </div>
            <div className="text-[9px] text-slate-500 font-bold space-y-0.5">
              <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFICADO CON QR
              </span>
              <p>ESCANEE PARA VALIDAR EN LÍNEA</p>
              <p className="text-[8px] text-slate-400 truncate max-w-[140px]">{selectedCert.codigo_verificacion_qr}</p>
            </div>
          </div>

          {/* Digital Signature Box */}
          <div className="text-center space-y-1">
            <div className="h-10 border-b border-slate-400 dark:border-slate-600 w-3/4 mx-auto flex items-end justify-center">
              <span className="text-[10px] italic text-blue-600 font-black">Párroco Alberto Quispe</span>
            </div>
            <p className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">
              {selectedCert.firmado_por}
            </p>
            <p className="text-[9px] text-slate-400">PÁRROCO DE SANTÍSIMA TRINIDAD</p>
          </div>
        </div>
      </div>
    </div>
  );
};
