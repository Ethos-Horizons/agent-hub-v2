// Centralized secrets management for Agent Hub
// This module handles secure access to sensitive configuration and credentials

import { logger } from '@/lib/logger';

export interface SecretConfig {
  name: string;
  value: string;
  encrypted: boolean;
  last_updated: string;
  access_level: 'public' | 'user' | 'admin' | 'service';
}

export interface EncryptedSecret {
  value: string;
  iv: Uint8Array;
}

class SecretsManager {
  private static instance: SecretsManager;
  private secrets = new Map<string, SecretConfig>();
  private encryptionKey: CryptoKey | null = null;

  private constructor() {
    // Load initial secrets from environment or secure storage
    const envSecrets = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      HMAC_WEBHOOK_SECRET: process.env.HMAC_WEBHOOK_SECRET,
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY, // Base64 encoded key
    };

    for (const [key, value] of Object.entries(envSecrets)) {
      if (value) {
        this.secrets.set(key, {
          name: key,
          value: value,
          encrypted: false, // Environment variables are not encrypted by this manager
          last_updated: new Date().toISOString(),
          access_level: key.includes('SERVICE_ROLE') || key.includes('HMAC') ? 'service' : 'public',
        });
      }
    }
  }

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  private async initializeEncryption(): Promise<void> {
    try {
      // Generate a new encryption key if none exists
      if (!this.encryptionKey) {
        const key = await crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256,
          },
          true,
          ['encrypt', 'decrypt']
        );

        // Store the key in memory (in production, consider more secure storage)
        this.encryptionKey = key;
        logger.info('Encryption key generated successfully');
      }
    } catch (error) {
      logger.warn('Failed to initialize encryption', { error });
      // Fallback to plaintext storage (not recommended for production)
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

  async setSecret(name: string, value: string, accessLevel: 'public' | 'user' | 'admin' | 'service' = 'user'): Promise<void> {
    try {
      await this.initializeEncryption();

      let encryptedValue: string;
      if (this.encryptionKey) {
        // Encrypt the value
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedValue = new TextEncoder().encode(value);

        const encrypted = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv,
          },
          this.encryptionKey,
          encodedValue
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted));

        encryptedValue = btoa(String.fromCharCode(...combined));
      } else {
        // Fallback to plaintext (not recommended)
        encryptedValue = value;
      }

      this.secrets.set(name, {
        name,
        value: encryptedValue,
        encrypted: !!this.encryptionKey,
        last_updated: new Date().toISOString(),
        access_level: accessLevel,
      });

      logger.info('Secret stored successfully', { key: name, access: accessLevel, encrypted: !!this.encryptionKey });
    } catch (error) {
      logger.warn('Failed to encrypt secret, storing as plaintext', { key: name, error });
      // Store as plaintext as last resort
      this.secrets.set(name, {
        name,
        value,
        encrypted: false,
        last_updated: new Date().toISOString(),
        access_level: accessLevel,
      });
    }
  }

  public async getEncryptedSecret(name: string): Promise<string | null> {
    const secret = this.secrets.get(name);
    if (!secret || !secret.encrypted) {
      return secret ? secret.value : null;
    }

    try {
      await this.initializeEncryption();
      if (!this.encryptionKey) {
        logger.error('Encryption key not initialized for decryption', { key: name });
        return null;
      }
      return await this.decryptValue(secret.value);
    } catch (error) {
      logger.error('Failed to decrypt secret', { key: name, error });
      return null;
    }
  }

  private async encryptValue(value: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(value);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.encryptionKey,
      encoded
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  private async decryptValue(encryptedValue: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available for decryption');
    }
    const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.encryptionKey,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  }

  private hasAccess(secretLevel: 'public' | 'user' | 'admin' | 'service', requestedLevel: 'public' | 'user' | 'admin' | 'service'): boolean {
    const levels = {
      'public': 0,
      'user': 1,
      'admin': 2,
      'service': 3,
    };
    return levels[secretLevel] >= levels[requestedLevel];
  }
}

export const secretsManager = SecretsManager.getInstance();

// Convenience functions for common secrets
export const getSupabaseUrl = () => secretsManager.getSecret('SUPABASE_URL');
export const getSupabaseAnonKey = () => secretsManager.getSecret('SUPABASE_ANON_KEY');
export const getSupabaseServiceRoleKey = () => secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY', 'service');
export const getOpenAiApiKey = () => secretsManager.getSecret('OPENAI_API_KEY', 'admin');
export const getAnthropicApiKey = () => secretsManager.getSecret('ANTHROPIC_API_KEY', 'admin');
export const getHmacWebhookSecret = () => secretsManager.getSecret('HMAC_WEBHOOK_SECRET', 'service');

// AI Model Configuration
export interface AIModelConfig {
  openai?: string;
  anthropic?: string;
  custom?: string;
}

export async function storeAIModelCredentials(name: string, config: AIModelConfig): Promise<void> {
  try {
    const configJson = JSON.stringify(config);
    await secretsManager.setSecret(`ai:${name}`, configJson, 'admin');
    logger.info('AI model credentials stored successfully', { name });
  } catch (error) {
    logger.error('Failed to store AI model credentials', { name, error });
    throw new Error('Failed to store AI model credentials');
  }
}

export const getAIModelCredentials = async (name: string): Promise<AIModelConfig | null> => {
  try {
    const value = await secretsManager.getEncryptedSecret(`ai:${name}`);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    logger.error('Failed to parse AI model credentials', { name, error });
    return null;
  }
};
