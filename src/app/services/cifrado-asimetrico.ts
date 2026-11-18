
import { Injectable } from '@angular/core';
import * as openpgp from 'openpgp';

@Injectable({
  providedIn: 'root'
})
export class CifradoAsimetricoService {

  async generarClaves(
    nombre: string,
    correo: string,
    frase: string
  ): Promise<{ clavePublica: string; clavePrivada: string }> {

    if (!nombre.trim() || !correo.trim()) {
      throw new Error('El nombre y el correo son obligatorios.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      throw new Error('Ingresa un correo electrónico válido.');
    }

    if (frase.trim() && frase.length < 12) {
      throw new Error(
        'Si utilizas una frase de seguridad, debe tener al menos 12 caracteres.'
      );
    }

    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 3072,
      userIDs: [
        {
          name: nombre.trim(),
          email: correo.trim()
        }
      ],
      ...(frase.trim() ? { passphrase: frase } : {}),
      format: 'armored'
    });

    return {
      clavePublica: publicKey,
      clavePrivada: privateKey
    };
  }
}
