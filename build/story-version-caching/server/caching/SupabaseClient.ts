import { useRuntimeConfig } from '#imports';

interface SupabaseCacheRow<T> {
  key: string;
  value: T;
  created_at?: string;
}

export class SupabaseClient<TValue = unknown> {
  private readonly url: string;
  private readonly apiKey: string;
  private readonly table: string;
  private readonly fetcher: typeof fetch;

  constructor() {
    const config = useRuntimeConfig();

    this.url = config.supabaseUrl ?? '';
    this.apiKey = config.supabaseKey ?? '';
    this.table = config.supabaseCacheTable ?? 'edge_cache';
    this.fetcher = globalThis.fetch.bind(globalThis);


    if (!this.url || !this.apiKey) {
      throw new Error('Supabase URL and API key are required in runtime config');
    }
  }

  async get<T = TValue>(key: string): Promise<T | null> {

    const requestUrl = `${this.url}/rest/v1/${this.table}?key=eq.${encodeURIComponent(key)}&limit=1`;
    var headers = this.headers({ Accept: 'application/json' });
    const response = await this.fetcher(`${requestUrl}`, {
      method: 'GET',
      headers: headers,
    });
    


    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase get failed (${response.status}): ${errorText}`);
    }

    const rows = (await response.json()) as SupabaseCacheRow<T>[];

    console.log(import.meta.server ? '[SSR] get' : '[CLIENT] get', key, rows, "error ")

    return rows[0]?.value ?? null;
  }

  async set<T = TValue>(key: string, value: T): Promise<void> {
    const response = await this.fetcher(`${this.url}/rest/v1/${this.table}`, {
      method: 'POST',
      headers: this.headers({ Prefer: 'resolution=merge-duplicates' }),
      body: JSON.stringify({ key, value }),
    });

    if (!response.ok) {
      throw new Error(`Supabase set failed (${response.status}): ${await response.text()}`);
    }
  }

  async remove(key: string): Promise<boolean> {
    const deleteUrl = `${this.url}/rest/v1/${this.table}?key=eq.${encodeURIComponent(key)}`;
    console.log('DELETE URL:', deleteUrl);
    console.log('DELETE key:', key);

    const response = await this.fetcher(deleteUrl, {
      method: 'DELETE',
      headers: this.headers({ Prefer: 'return=representation' }),
    });

    if (!response.ok) {
      throw new Error(`Supabase remove failed (${response.status}): ${await response.text()}`);
    }

    const responseText = await response.text();
    const deletedRows = responseText ? JSON.parse(responseText) : [];
    console.log('Deleted rows:', deletedRows);

    return Array.isArray(deletedRows) && deletedRows.length > 0;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      ...extra,
    };
  }
}

let _supabaseClient: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  if (!_supabaseClient) {
    _supabaseClient = new SupabaseClient();
  }
  return _supabaseClient;
}
