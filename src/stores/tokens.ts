import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Helper to convert ArrayBuffer to a Base64 string
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

// Helper to convert a Base64 string to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

const asyncLocalStorage = {
  setItem: async (key: string, value: string) => {
    return Promise.resolve().then(() => {
      localStorage.setItem(key, value)
    })
  },
  getItem: async (key: string) => {
    return Promise.resolve().then(() => {
      return localStorage.getItem(key)
    })
  }
}

// Helper to derive a key from a passcode and salt
const deriveKeyFromPasscodeAndSalt = async (passcode: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(passcode),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
  )
  return window.crypto.subtle.deriveKey(
      {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
  )
}

export const useTokensStore = defineStore(
  'tokens',
  () => {
    const tokens = ref<
      {
        name: string
        username: string
        color: string
        secret: string
      }[]
    >([])

    const encryptionKey = ref<CryptoKey | null>(null)
    const passcode = ref('')

    const setPasscode = async (newPasscode: string) => {
      passcode.value = newPasscode
      if (newPasscode) {
        let saltBase64 = localStorage.getItem('passcodeSalt')
        let salt: Uint8Array
        if (saltBase64) {
          salt = new Uint8Array(base64ToBuffer(saltBase64))
        } else {
          salt = window.crypto.getRandomValues(new Uint8Array(16))
          localStorage.setItem('passcodeSalt', bufferToBase64(salt.buffer))
        }
        encryptionKey.value = await deriveKeyFromPasscodeAndSalt(newPasscode, salt)
      } else {
        encryptionKey.value = null
        localStorage.removeItem('passcodeSalt')
      }
    }

    const addToken = (token: {
      name: string
      username: string
      color: string
      secret: string
    }) => {
      tokens.value.push(token)
    }

    const init = async () => {
      const raw = await asyncLocalStorage.getItem('tokens')
      const saltBase64 = localStorage.getItem('passcodeSalt')
      if (raw && encryptionKey.value && saltBase64) {
        try {
          const { iv: ivBase64, data: dataBase64 } = JSON.parse(raw)
          const iv = base64ToBuffer(ivBase64)
          const data = base64ToBuffer(dataBase64)

          const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            encryptionKey.value,
            data
          )

          const decoded = new TextDecoder().decode(decrypted)
          tokens.value = JSON.parse(decoded)
        } catch (e) {
          console.error('Decryption failed:', e)
        }
      } else if (raw) {
        try {
          tokens.value = JSON.parse(raw)
        } catch (e) {
          console.error('Failed to parse tokens:', e)
        }
      }
    }

    const verifyPasscode = async (testPasscode: string): Promise<boolean> => {
      const raw = await asyncLocalStorage.getItem('tokens')
      const saltBase64 = localStorage.getItem('passcodeSalt')

      if (!saltBase64) {
        // No salt, so no passcode is set.
        return true
      }

      if (!raw) {
        // No tokens saved yet, so no way to verify. Assume valid for now.
        return true
      }

      try {
        const salt = new Uint8Array(base64ToBuffer(saltBase64))
        const testKey = await deriveKeyFromPasscodeAndSalt(testPasscode, salt)

        const { iv: ivBase64, data: dataBase64 } = JSON.parse(raw)
        const iv = base64ToBuffer(ivBase64)
        const data = base64ToBuffer(dataBase64)

        await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          testKey,
          data
        )
        return true
      } catch (e) {
        return false
      }
    }

    const reEncryptAndSetNewPasscode = async (newPasscode: string) => {
      if (newPasscode) {
        const encoder = new TextEncoder()
        // Always generate a new random 16-byte salt
        const salt = window.crypto.getRandomValues(new Uint8Array(16))
        // Store the new salt in localStorage as base64
        localStorage.setItem('passcodeSalt', bufferToBase64(salt.buffer))

        const newDerivedKey = await deriveKeyFromPasscodeAndSalt(newPasscode, salt)

        // Encrypt current tokens with the new key
        const iv = window.crypto.getRandomValues(new Uint8Array(12))
        const encoded = encoder.encode(JSON.stringify(tokens.value))

        const encrypted = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          newDerivedKey,
          encoded
        )

        const payload = {
          iv: bufferToBase64(iv),
          data: bufferToBase64(encrypted),
        }

        await asyncLocalStorage.setItem('tokens', JSON.stringify(payload))

        // Update the in-memory key and passcode
        encryptionKey.value = newDerivedKey
        passcode.value = newPasscode
      } else {
        // If the new passcode is empty, save the tokens as plaintext
        await asyncLocalStorage.setItem('tokens', JSON.stringify(tokens.value))
        encryptionKey.value = null
        passcode.value = ''
        localStorage.removeItem('passcodeSalt')
      }
    }

    watch(tokens, async (newTokens) => {
      if (encryptionKey.value) {
        try {
          const iv = window.crypto.getRandomValues(new Uint8Array(12))
          const encoded = new TextEncoder().encode(JSON.stringify(newTokens))

          const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            encryptionKey.value,
            encoded
          )

          const payload = {
            iv: bufferToBase64(iv),
            data: bufferToBase64(encrypted),
          }

          await asyncLocalStorage.setItem('tokens', JSON.stringify(payload))
        } catch (e) {
          console.error('Encryption failed:', e)
        }
      } else {
        await asyncLocalStorage.setItem('tokens', JSON.stringify(newTokens))
      }
    }, { deep: true })

    return {
      tokens,
      encryptionKey,
      passcode,
      setPasscode,
      addToken,
      verifyPasscode,
      init,
      reEncryptAndSetNewPasscode,
    }
  },
)
