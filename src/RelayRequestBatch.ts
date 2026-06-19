import type { FetchOpts, Variables } from './definition';
import type RelayRequest from './RelayRequest';
import RRNLError from './RRNLError';

export type Requests = RelayRequest[];

export default class RelayRequestBatch {
  fetchOpts: Partial<FetchOpts>;
  requests: Requests;

  constructor(requests: Requests) {
    this.requests = requests;
    this.fetchOpts = {
      method: 'POST',
      headers: {},
      body: this.prepareBody(),
    };
  }

  setFetchOption(name: string, value: unknown): void {
    this.fetchOpts[name] = value;
  }

  setFetchOptions(opts: Partial<FetchOpts>): void {
    this.fetchOpts = {
      ...this.fetchOpts,
      ...opts,
    };
  }

  getBody(): string {
    if (!this.fetchOpts.body) {
      this.fetchOpts.body = this.prepareBody();
    }
    return (this.fetchOpts.body as string) || '';
  }

  prepareBody(): string {
    return `[${this.requests.map((r) => r.getBody()).join(',')}]`;
  }

  getIds(): string[] {
    return this.requests.map((r) => r.getID());
  }

  getID(): string {
    return `BATCH_REQUEST:${this.getIds().join(':')}`;
  }

  isMutation(): boolean {
    return false;
  }

  isFormData(): boolean {
    return false;
  }

  clone(): RelayRequestBatch {
    const newRequest: RelayRequestBatch = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
    newRequest.fetchOpts = { ...this.fetchOpts };
    newRequest.fetchOpts.headers = { ...this.fetchOpts.headers };
    return newRequest;
  }

  getVariables(): Variables {
    throw new RRNLError('Batch request does not have variables.');
  }

  getQueryString(): string {
    return this.prepareBody();
  }
}
