from dataclasses import dataclass


@dataclass(frozen=True)
class UbicacionFisica:
    """
    Value Object inmutable que representa la ubicación física de un documento en el archivo parroquial.
    """
    numero_libro: int
    numero_folio: int
    numero_partida: int

    def __post_init__(self):
        if self.numero_libro <= 0 or self.numero_folio <= 0 or self.numero_partida <= 0:
            raise ValueError("El número de libro, folio y partida deben ser números enteros positivos.")

    def __str__(self) -> str:
        return f"Libro {self.numero_libro}, Folio {self.numero_folio}, Partida {self.numero_partida}"
