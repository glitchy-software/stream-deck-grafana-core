/**
 * Handles Web Crypto API (Best built-in performance). Web Crypto is hardware-accelerated where available.
 * 
 * @author Gerard de Jong
 * @copyright glitchysoftware 2026
 */
export class EncryptionHander {

  // Generate a random AES-GCM 256-bit key
  public static async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Export the key for storage/transmission
  public static async exportKey(key: CryptoKey): Promise<string> {
    const raw = await crypto.subtle.exportKey("raw", key);
    return Buffer.from(raw).toString("base64");
  }

  // Import a base64-encoded key
  public static async importKey(base64: string): Promise<CryptoKey> {
    // Convert Node Buffer → real WebCrypto type
    const raw = new Uint8Array(Buffer.from(base64, "base64"));

    return crypto.subtle.importKey(
      "raw",
      raw,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Encrypt text
  public static async encrypt(key: CryptoKey, plaintext: string) : Promise<{ iv: string; data: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit recommended
    const data = new TextEncoder().encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return {
      iv: Buffer.from(iv).toString("base64"),
      data: Buffer.from(ciphertext).toString("base64"),
    };
  }

  // Decrypt
  public static async decrypt(key: CryptoKey, iv64: string, data64: string) : Promise<string> {
    const iv = Uint8Array.from(atob(iv64), c => c.charCodeAt(0));
    const data = Uint8Array.from(atob(data64), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  }
}
