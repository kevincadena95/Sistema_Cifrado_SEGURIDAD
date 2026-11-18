
import { Injectable } from '@angular/core';

export interface ParClaves {
  publica: string;
  privada: string;
}

@Injectable({
  providedIn: 'root'
})
export class CifradoAsimetricoService {

  async generarParClaves(): Promise<ParClaves> {

    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      throw new Error(
        'La generación de claves requiere un navegador compatible y una conexión segura.'
      );
    }

    // Generar un par de claves RSA
    const claves = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 3072,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    ) as CryptoKeyPair;

    // Exportar la clave pública y privada
    const [publica, privada] = await Promise.all([
      window.crypto.subtle.exportKey('spki', claves.publicKey),
      window.crypto.subtle.exportKey('pkcs8', claves.privateKey)
    ]);

    return {
      publica: this.convertirPEM(publica, 'PUBLIC KEY'),
      privada: this.convertirPEM(privada, 'PRIVATE KEY')
    };
  }

  // Convertir las claves al formato PEM
  private convertirPEM(
    datos: ArrayBuffer,
    tipo: string
  ): string {

    const bytes = new Uint8Array(datos);
    let binario = '';

    for (const byte of bytes) {
      binario += String.fromCharCode(byte);
    }

    const base64 = btoa(binario);

    const contenido = base64
      .match(/.{1,64}/g)
      ?.join('\n') ?? '';

    return `-----BEGIN ${tipo}-----\n${contenido}\n-----END ${tipo}-----`;
  }
}
