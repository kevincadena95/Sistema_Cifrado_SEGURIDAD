
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CifradoAsimetricoService } from '../../services/cifrado-asimetrico';

@Component({
  selector: 'app-cifrado-asimetrico',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cifrado-asimetrico.html',
  styleUrl: './cifrado-asimetrico.css'
})
export class CifradoAsimetrico {

  nombre = '';
  correo = '';
  frase = '';

  clavePublica = '';
  clavePrivada = '';

  mostrarClavePrivada = false;
  sinProteccion = false;
  generando = false;

  mensaje = '';
  error = '';

  constructor(
    private cifradoService: CifradoAsimetricoService,
    private cdr: ChangeDetectorRef
  ) { }

  // GENERAR CLAVES
  async generarClaves() {

    this.error = '';
    this.mensaje = '';
    this.clavePublica = '';
    this.clavePrivada = '';
    this.mostrarClavePrivada = false;
    this.sinProteccion = false;
    this.generando = true;

    try {

      const claves = await this.cifradoService.generarClaves(
        this.nombre,
        this.correo,
        this.frase
      );

      this.clavePublica = claves.clavePublica;
      this.clavePrivada = claves.clavePrivada;

      this.sinProteccion = !this.frase.trim();

      this.mensaje = 'Las claves se generaron correctamente.';

    } catch (error: unknown) {

      this.error = error instanceof Error
        ? error.message
        : 'Ocurrió un error al generar las claves.';

    } finally {

      this.generando = false;
      this.cdr.detectChanges();

    }
  }

  // MOSTRAR U OCULTAR CLAVE PRIVADA
  alternarClavePrivada() {
    this.mostrarClavePrivada = !this.mostrarClavePrivada;
  }

  // COPIAR CLAVE PUBLICA
  async copiarClavePublica() {
    await this.copiarTexto(
      this.clavePublica,
      'Clave pública copiada correctamente.'
    );
  }

  // COPIAR CLAVE PRIVADA
  async copiarClavePrivada() {

    if (!this.mostrarClavePrivada) return;

    await this.copiarTexto(
      this.clavePrivada,
      'Clave privada copiada correctamente.'
    );
  }

  // FUNCION PARA COPIAR TEXTO
  private async copiarTexto(
    contenido: string,
    mensajeExito: string
  ) {

    if (!contenido) return;

    try {

      await navigator.clipboard.writeText(contenido);

      this.mensaje = mensajeExito;
      this.error = '';

    } catch {

      this.error = 'No se pudo copiar el contenido al portapapeles.';

    } finally {

      this.cdr.detectChanges();

    }
  }

  // DESCARGAR CLAVE PUBLICA
  descargarClavePublica() {

    if (!this.clavePublica) return;

    this.descargarArchivo(
      this.clavePublica,
      'clave-publica.asc'
    );
  }

  // DESCARGAR CLAVE PRIVADA
  descargarClavePrivada() {

    if (!this.clavePrivada) return;

    this.descargarArchivo(
      this.clavePrivada,
      'clave-privada.asc'
    );
  }

  // GENERAR ARCHIVO DESCARGABLE
  private descargarArchivo(
    contenido: string,
    nombreArchivo: string
  ) {

    const archivo = new Blob(
      [contenido],
      { type: 'application/pgp-keys' }
    );

    const url = URL.createObjectURL(archivo);

    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
