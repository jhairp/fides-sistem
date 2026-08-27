from abc import ABC, abstractmethod
from typing import Dict, Any


class PDFGeneratorPort(ABC):
    """Puerto de salida abstracto para la generación de Certificados oficiales en PDF"""

    @abstractmethod
    def generar_certificado_pdf(self, datos_partida: Dict[str, Any]) -> bytes:
        """Genera el buffer de bytes del certificado oficial PDF con marca de agua y código QR."""
        pass
