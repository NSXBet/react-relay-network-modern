import type { FetchResponse, GraphQLResponseErrors, PayloadData } from './definition';

export default class RelayResponse {
  _res: any; // response from low-level method, eg. fetch

  data?: PayloadData | null;
  errors?: GraphQLResponseErrors | null;

  ok: any;
  status!: number;
  statusText?: string | null;
  headers?: { [name: string]: string } | null;
  url?: string | null;
  text?: string | null;
  json?: unknown;

  static async createFromFetch(res: FetchResponse): Promise<RelayResponse> {
    const r = new RelayResponse();
    r._res = res;
    r.ok = res.ok;
    r.status = res.status;
    r.url = res.url;
    r.headers = res.headers as any;

    if (res.status < 200 || res.status >= 300) {
      r.text = await res.text();
    } else {
      r.processJsonData(await res.json());
    }

    return r;
  }

  static async createFromGraphQL(res: { errors?: any; data?: any }): Promise<RelayResponse> {
    const r = new RelayResponse();
    r._res = res;
    r.ok = true;
    r.status = 200;
    r.data = res.data;
    r.errors = res.errors;

    return r;
  }

  processJsonData(json: unknown): void {
    this.json = json;
    if (json) {
      const j = json as { data?: any; errors?: any };
      if (j.data) this.data = j.data;
      if (j.errors) this.errors = j.errors;
    }
  }

  clone(): RelayResponse {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  toString(): string {
    return [
      `Response:`,
      `   Url: ${this.url || ''}`,
      `   Status code: ${this.status || ''}`,
      `   Status text: ${this.statusText || ''}`,
      `   Response headers: ${JSON.stringify(this.headers) || ''}`,
      `   Response body: ${JSON.stringify(this.json) || ''}`,
    ].join('\n');
  }
}
