import { EncryptionHander } from '../src/encryption-handler';

describe('Testing Encryption Hander', () => {

    test('Test encryption and decryption round trip', async () => {
        // Generate fresh key
        const key = await EncryptionHander.generateKey();

        // Export to string (store in DB / vault)
        const exported = await EncryptionHander.exportKey(key);

        process.stderr.write(`Encryption Handler Test: Generated key: ${exported}\n`);

        // Later... recreate key object
        const importedKey = await EncryptionHander.importKey(exported);

        //const text = "Sensitive payload 123";
        const text = "glsa_WdnRSgR06P8wtHuBn9RhqZaaOC1f2slN_c2787615";
        

        const encrypted = await EncryptionHander.encrypt(importedKey, text);

        process.stderr.write(`Encryption Handler Test: Encrypted text: ${encrypted.data} Initialisation Vector: ${encrypted.iv}\n`);


        const decrypted = await EncryptionHander.decrypt(
            importedKey,
            encrypted.iv,
            encrypted.data
        );

        process.stderr.write(`Encryption Handler Test: Decrypted text: ${decrypted}\n`);

        // Verify roundtrip okay
        expect(decrypted).toBe(text);
    });

});


describe('Testing Encryption Hander', () => {

    test.skip('Test encryption and decryption round trip', async () => {
        // Recreate key object
        const importedKey = await EncryptionHander.importKey("3QDdPP6e/tSjP0YKpzE7PGl8G/p/qMUqvJv3wvbQxd4=");

        //const text = "Sensitive payload 123";
        const text = "glsa_WdnRSgR06P8wtHuBn9RhqZaaOC1f2slN_c2787615";
        
        const encrypted = await EncryptionHander.encrypt(importedKey, text);

        process.stderr.write(`Encryption Handler Test: Encrypted text: ${encrypted.data} Initialisation Vector: ${encrypted.iv}\n`);


        const decrypted = await EncryptionHander.decrypt(
            importedKey,
            "92qYZPGnTOIRq+B3",
            "AeFE/7a2flcORHN0WBWU0TOSNcN0w5CSkOBv/viz"
        );

        process.stderr.write(`Encryption Handler Test: Decrypted text: ${decrypted}\n`);

        // Verify roundtrip okay
        expect(decrypted).toBe(text);
    });

});
