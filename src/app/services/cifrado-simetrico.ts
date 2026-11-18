
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CifradoSimetricoService {

  private readonly firma = new Uint8Array([83, 67, 70, 49]);
  private readonly iteraciones = 300000;


  // CREAR CLAVE AES A PARTIR DE UNA CONTRASEÑA
  private async crearClave(
    contrasena: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {

    const material = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(contrasena),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(salt),
        iterations: this.iteraciones,
        hash: 'SHA-256'
      },
      material,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }


  // CIFRAR ARCHIVO
  async cifrarArchivo(
    archivo: File,
    contrasena: string
  ): Promise<Blob> {

    if (contrasena.length < 12) {
      throw new Error(
        'La clave debe tener al menos 12 caracteres.'
      );
    }

    // Valores aleatorios para cada cifrado
    const salt = crypto.getRandomValues(
      new Uint8Array(16)
    );

    const iv = crypto.getRandomValues(
      new Uint8Array(12)
    );

    const clave = await this.crearClave(contrasena, salt);

    // Leer el archivo original
    const contenido = await archivo.arrayBuffer();

    // Cifrar el contenido
    const cifrado = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      clave,
      contenido
    );

    const datosCifrados = new Uint8Array(cifrado);

    // Estructura del archivo:
    // firma (4) + salt (16) + iv (12) + datos cifrados

    const resultado = new Uint8Array(
      4 + 16 + 12 + datosCifrados.length
    );

    resultado.set(this.firma, 0);
    resultado.set(salt, 4);
    resultado.set(iv, 20);
    resultado.set(datosCifrados, 32);

    return new Blob(
      [resultado],
      { type: 'application/octet-stream' }
    );
  }

  // DESCIFRAR ARCHIVO
  async descifrarArchivo(
    archivo: File,
    contrasena: string
  ): Promise<Blob> {

    if (!contrasena) {
      throw new Error('Ingresa la clave de descifrado.');
    }

    const contenido = new Uint8Array(
      await archivo.arrayBuffer()
    );

    // Verificar la estructura del archivo cifrado
    if (contenido.length < 48) {
      throw new Error('El archivo cifrado no es válido.');
    }

    for (let i = 0; i < this.firma.length; i++) {
      if (contenido[i] !== this.firma[i]) {
        throw new Error(
          'El archivo no pertenece a este sistema de cifrado.'
        );
      }
    }

    // Recuperar salt, IV y contenido cifrado
    const salt = contenido.slice(4, 20);
    const iv = contenido.slice(20, 32);
    const datosCifrados = contenido.slice(32);

    const clave = await this.crearClave(contrasena, salt);

    try {

      const descifrado = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        clave,
        datosCifrados
      );

      return new Blob(
        [descifrado],
        { type: 'application/octet-stream' }
      );

    } catch {

      throw new Error(
        'No se pudo descifrar. Verifica la clave o el archivo.'
      );

    }
  }
}
