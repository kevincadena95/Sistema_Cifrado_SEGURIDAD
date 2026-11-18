
import { Component, inject } from '@angular/core';
import { CifradoAsimetricoService } from '../../services/cifrado-asimetrico';

@Component({
  selector: 'app-cifrado-asimetrico',
  standalone: true,
  imports: [],
  templateUrl: './cifrado-asimetrico.html',
  styleUrl: './cifrado-asimetrico.css'
})
export class CifradoAsimetrico {

  private servicio = inject(CifradoAsimetricoService);

  clavePublica = '';
  clavePrivada = '';

  generando = false;
  mostrarPrivada = false;

  mensaje = '';
  error = '';

  // Generar las claves
  async generarClaves(): Promise<void> {

    if (this.generando) return;

    this.generando = true;
    this.mensaje = '';
    this.error = '';

    try {
      const claves = await this.servicio.generarParClaves();

      this.clavePublica = claves.publica;
      this.clavePrivada = claves.privada;

      this.mostrarPrivada = false;

      this.mensaje = 'Las claves se generaron correctamente.';

    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : 'No se pudieron generar las claves.';

    } finally {
      this.generando = false;
    }
  }

  // Mostrar u ocultar la clave privada
  cambiarVisibilidad(): void {
    this.mostrarPrivada = !this.mostrarPrivada;
  }

  // Copiar una clave
  async copiarClave(
    clave: string,
    tipo: string
  ): Promise<void> {

    try {
      await navigator.clipboard.writeText(clave);

      this.error = '';
      this.mensaje = `Clave ${tipo} copiada correctamente.`;

    } catch {
      this.mensaje = '';
      this.error = 'No se pudo copiar la clave.';
    }
  }

  // Descargar una clave en formato PEM
  descargarClave(
    clave: string,
    nombre: string
  ): void {

    const archivo = new Blob(
      [clave],
      { type: 'application/x-pem-file;charset=utf-8' }
    );

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombre;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
