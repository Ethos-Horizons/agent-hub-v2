// Centralized secrets management for Agent Hub
// This module handles secure access to sensitive configuration and credentials

export interface SecretConfig {
  name: string;
  value: string;
  encrypted: boolean;
  last_updated: string;
  access_level: 'public' | 'user' | 'admin' | 'service';
}

export interface EncryptedSecret {
  encrypted_value: string;
  encryption_key_id: string;
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  nonce: string;
  tag: string;
}

class SecretsManager {
  private static instance: SecretsManager;
  private secrets: Map<string, SecretConfig> = new Map();
  private encryptionKey: CryptoKey | null = null;

  private constructor() {
    this.initializeSecrets();
  }

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  private async initializeSecrets() {
    // Load secrets from environment variables and secure storage
    const envSecrets: Record<string, string> = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      N8N_DEFAULT_URL: process.env.N8N_DEFAULT_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || '',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
    };

    // Store public secrets (client-side accessible)
    Object.entries(envSecrets).forEach(([key, value]) => {
      if (value) {
        this.secrets.set(key, {
          name: key,
          value,
          encrypted: false,
          last_updated: new Date().toISOString(),
          access_level: key.startsWith('NEXT_PUBLIC_') ? 'public' : 'service',
        });
      }
    });

    // Initialize encryption if key is available
    if (envSecrets.ENCRYPTION_KEY) {
      await this.initializeEncryption(envSecrets.ENCRYPTION_KEY);
    }
  }

  private async initializeEncryption(keyMaterial: string) {
    try {
      // Convert base64 key to CryptoKey
      const keyData = Uint8Array.from(atob(keyMaterial), c => c.charCodeAt(0));
      this.encryptionKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('Failed to initialize encryption:', error);
    }
  }

  public getSecret(name: string, accessLevel: 'public' | 'user' | 'admin' | 'service' = 'public'): string | null {
    const secret = this.secrets.get(name);
    
    if (!secret) {
      return null;
    }

    // Check access level
    if (this.hasAccess(secret.access_level, accessLevel)) {
      return secret.value;
    }

    return null;
  }

  public async setSecret(name: string, value: string, accessLevel: 'public' | 'user' | 'admin' | 'service' = 'user'): Promise<void> {
    let encryptedValue = value;
    let encrypted = false;

    // Encrypt sensitive secrets
    if (accessLevel !== 'public' && this.encryptionKey) {
      try {
        encryptedValue = await this.encryptValue(value);
        encrypted = true;
      } catch (error) {
        console.warn('Failed to encrypt secret, storing as plaintext:', error);
      }
    }

    this.secrets.set(name, {
      name,
      value: encryptedValue,
      encrypted,
      last_updated: new Date().toISOString(),
      access_level: accessLevel,
    });

    // Persist to secure storage (implementation depends on platform)
    await this.persistSecret(name, encryptedValue, accessLevel);
  }

  public async getEncryptedSecret(name: string): Promise<string | null> {
    const secret = this.secrets.get(name);
    
    if (!secret || !secret.encrypted) {
      return null;
    }

    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      return await this.decryptValue(secret.value);
    } catch (error) {
      console.error('Failed to decrypt secret:', error);
      return null;
    }
  }

  private async encryptValue(value: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      this.encryptionKey,
      data
    );

    // Combine nonce and encrypted data
    const result = new Uint8Array(nonce.length + encrypted.byteLength);
    result.set(nonce);
    result.set(new Uint8Array(encrypted), nonce.length);

    return btoa(String.fromCharCode(...result));
  }

  private async decryptValue(encryptedValue: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    const data = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    const nonce = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      this.encryptionKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private hasAccess(secretLevel: string, requestedLevel: string): boolean {
    const levels = ['public', 'user', 'admin', 'service'];
    const secretIndex = levels.indexOf(secretLevel);
    const requestedIndex = levels.indexOf(requestedLevel);
    
    return requestedIndex >= secretIndex;
  }

  private async persistSecret(name: string, value: string, accessLevel: string): Promise<void> {
    // Implementation depends on the platform:
    // - Browser: localStorage/sessionStorage for public, IndexedDB for private
    // - Node.js: Environment variables or secure key management
    // - Supabase: Encrypted storage in database
    
    if (typeof window !== 'undefined') {
      // Browser environment
      if (accessLevel === 'public') {
        localStorage.setItem(`secret_${name}`, value);
      } else {
        // For private secrets, use a more secure storage method
        // This is a simplified example - in production, use proper secure storage
        sessionStorage.setItem(`secret_${name}`, value);
      }
    }
  }

  public listSecrets(accessLevel: 'public' | 'user' | 'admin' | 'service' = 'public'): string[] {
    const accessibleSecrets: string[] = [];
    
    for (const [name, secret] of this.secrets.entries()) {
      if (this.hasAccess(secret.access_level, accessLevel)) {
        accessibleSecrets.push(name);
      }
    }
    
    return accessibleSecrets;
  }

  public removeSecret(name: string): boolean {
    const removed = this.secrets.delete(name);
    
    if (removed && typeof window !== 'undefined') {
      localStorage.removeItem(`secret_${name}`);
      sessionStorage.removeItem(`secret_${name}`);
    }
    
    return removed;
  }

  public getSecretMetadata(name: string): Omit<SecretConfig, 'value'> | null {
    const secret = this.secrets.get(name);
    
    if (!secret) {
      return null;
    }
    
    return {
      name: secret.name,
      encrypted: secret.encrypted,
      last_updated: secret.last_updated,
      access_level: secret.access_level,
    };
  }
}

// Export singleton instance
export const secretsManager = SecretsManager.getInstance();

// Convenience functions for common secrets
export const getSupabaseUrl = () => secretsManager.getSecret('SUPABASE_URL');
export const getSupabaseAnonKey = () => secretsManager.getSecret('SUPABASE_ANON_KEY');
export const getSupabaseServiceKey = () => secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY', 'service');
export const getN8nDefaultUrl = () => secretsManager.getSecret('N8N_DEFAULT_URL');
export const getJwtSecret = () => secretsManager.getSecret('JWT_SECRET', 'service');

// Secure credential storage for n8n connections
export interface N8nCredentials {
  base_url: string;
  auth_type: 'apiKey' | 'basic' | 'oauth';
  credentials: Record<string, string>;
}

export const storeN8nCredentials = async (name: string, credentials: N8nCredentials): Promise<void> => {
  const secretName = `n8n_${name}`;
  const value = JSON.stringify(credentials);
  await secretsManager.setSecret(secretName, value, 'user');
};

export const getN8nCredentials = async (name: string): Promise<N8nCredentials | null> => {
  const secretName = `n8n_${name}`;
  const value = await secretsManager.getEncryptedSecret(secretName);
  
  if (!value) {
    return null;
  }
  
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse n8n credentials:', error);
    return null;
  }
};

export const removeN8nCredentials = (name: string): boolean => {
  const secretName = `n8n_${name}`;
  return secretsManager.removeSecret(secretName);
};
