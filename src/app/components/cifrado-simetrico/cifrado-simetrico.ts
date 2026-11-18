
import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  ViewChild
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CifradoSimetricoService } from '../../services/cifrado-simetrico';

@Component({
  selector: 'app-cifrado-simetrico',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cifrado-simetrico.html',
  styleUrl: './cifrado-simetrico.css'
})
export class CifradoSimetrico {

  @ViewChild('archivoInput')
  archivoInput?: ElementRef<HTMLInputElement>;

  modo: 'cifrar' | 'descifrar' = 'cifrar';

  archivo: File | null = null;
  clave = '';

  resultado: Blob | null = null;
  nombreResultado = '';

  procesando = false;
  mensaje = '';
  error = '';

  constructor(
    private cifradoService: CifradoSimetricoService,
    private cdr: ChangeDetectorRef
  ) { }

  // CAMBIAR ENTRE CIFRAR Y DESCIFRAR
  cambiarModo(modo: 'cifrar' | 'descifrar') {

    if (this.procesando) return;

    this.modo = modo;
    this.archivo = null;
    this.clave = '';

    if (this.archivoInput) {
      this.archivoInput.nativeElement.value = '';
    }

    this.limpiarResultado();
  }

  // SELECCIONAR DOCUMENTO
  seleccionarArchivo(evento: Event) {

    const input = evento.target as HTMLInputElement;

    this.archivo = input.files?.[0] ?? null;

    this.limpiarResultado();
  }

  // LIMPIAR RESULTADOS
  private limpiarResultado() {

    this.resultado = null;
    this.nombreResultado = '';
    this.mensaje = '';
    this.error = '';
  }

  // CIFRAR O DESCIFRAR
  async procesarArchivo() {

    this.limpiarResultado();

    if (!this.archivo) {
      this.error = 'Selecciona un archivo.';
      return;
    }

    if (this.clave.length < 12) {
      this.error = 'La clave debe tener al menos 12 caracteres.';
      return;
    }

    if (
      this.modo === 'descifrar' &&
      !this.archivo.name.toLowerCase().endsWith('.enc')
    ) {
      this.error = 'Selecciona un archivo cifrado con extensión .enc.';
      return;
    }

    this.procesando = true;

    try {

      if (this.modo === 'cifrar') {

        this.resultado = await this.cifradoService.cifrarArchivo(
          this.archivo,
          this.clave
        );

        this.nombreResultado = this.archivo.name + '.enc';

        this.mensaje = 'El archivo fue cifrado correctamente.';

      } else {

        this.resultado = await this.cifradoService.descifrarArchivo(
          this.archivo,
          this.clave
        );

        this.nombreResultado = this.archivo.name.slice(0, -4);

        this.mensaje = 'El archivo fue descifrado correctamente.';
      }

      // No mantener la contraseña en el formulario
      this.clave = '';

    } catch (error: unknown) {

      this.error = error instanceof Error
        ? error.message
        : 'Ocurrió un error al procesar el archivo.';

    } finally {

      this.procesando = false;
      this.cdr.detectChanges();

    }
  }

  // DESCARGAR RESULTADO
  descargarArchivo() {

    if (!this.resultado) return;

    const url = URL.createObjectURL(this.resultado);

    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = this.nombreResultado;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
