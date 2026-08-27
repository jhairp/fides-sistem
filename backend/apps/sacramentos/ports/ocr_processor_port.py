from abc import ABC, abstractmethod
from typing import Dict, Any


class OCRProcessorPort(ABC):
    """Puerto de salida abstracto para motores de Inteligencia Artificial / OCR"""

    @abstractmethod
    def procesar_imagen_escaneada(self, imagen_bytes: bytes) -> Dict[str, Any]:
        """Extrae texto y entidades estructuradas (nombres, fechas, folios) de la imagen."""
        pass
