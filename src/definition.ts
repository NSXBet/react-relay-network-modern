import type { RequestParameters } from 'relay-runtime';
import type RelayRequest from './RelayRequest';
import type RelayRequestBatch from './RelayRequestBatch';
import type RelayResponse from './RelayResponse';

export type RelayRequestAny = RelayRequest | RelayRequestBatch;
export type MiddlewareNextFn = (req: RelayRequestAny) => Promise<RelayResponse>;
export type Middleware = (next: MiddlewareNextFn) => MiddlewareNextFn;
export type MiddlewareRawNextFn = (req: RelayRequestAny) => Promise<FetchResponse>;

export interface MiddlewareRaw {
  (next: MiddlewareRawNextFn): MiddlewareRawNextFn;
  isRawMiddleware: true;
}

export interface MiddlewareSync {
  execute: (
    operation: RequestParameters,
    variables: Variables,
    cacheConfig: CacheConfig,
    uploadables?: UploadableMap | null
  ) => ObservableFromValue<QueryPayload> | null | undefined;
}

export interface FetchOpts {
  url?: string;
  method: 'POST' | 'GET';
  headers: { [name: string]: string };
  body: string | FormData;
  // Available request modes in fetch options. For details see https://fetch.spec.whatwg.org/#requests
  credentials?: 'same-origin' | 'include' | 'omit';
  mode?: 'cors' | 'websocket' | 'navigate' | 'no-cors' | 'same-origin';
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  redirect?: 'follow' | 'error' | 'manual';
  signal?: AbortSignal;
  [name: string]: unknown;
}

export type FetchResponse = Response;

export type GraphQLResponseErrors = Array<{
  message: string;
  locations?: Array<{
    column: number;
    line: number;
  }>;
  stack?: Array<string>;
}>;

export interface GraphQLResponse {
  data?: any;
  errors?: GraphQLResponseErrors;
}

export interface RRNLResponseObject {
  ok: any;
  status: number;
  statusText: string;
  headers: { [name: string]: string };
  url: string;
  payload: GraphQLResponse | null | undefined;
}

// ///////////////////////////
// Relay Modern re-exports
// ///////////////////////////

export interface Variables {
  [name: string]: any;
}
export interface CacheConfig {
  force?: boolean | null;
  poll?: number | null;
  rerunParamExperimental?: any;
  skipBatch?: boolean | null;
}
export interface Disposable {
  dispose(): void;
}
export type Uploadable = File | Blob;
export interface UploadableMap {
  [key: string]: Uploadable;
}
export interface PayloadData {
  [key: string]: unknown;
}
export type QueryPayload =
  | {
      data?: PayloadData | null;
      errors?: Array<any>;
      rerunVariables?: Variables;
    }
  | RelayResponse;

export type UnsubscribeFunction = () => void;
export interface Sink<T> {
  next: (value: T) => void;
  complete: () => void;
  error: (value: T) => void;
}
// this is workaround should be class from relay-runtime/network/RelayObservable.js
export interface RelayObservable<T> {
  subscribe: (sink: Sink<T>) => UnsubscribeFunction;
}
// Note: This should accept Subscribable<T> instead of RelayObservable<T>,
// however Flow cannot yet distinguish it from T.
export type ObservableFromValue<T> = RelayObservable<T> | Promise<T> | T;
export type FetchFunction = (
  operation: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null
) => ObservableFromValue<QueryPayload>;
export type FetchHookFunction = (
  operation: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null
) => void | ObservableFromValue<QueryPayload>;
// See SubscribeFunction type declaration in relay-runtime/network/RelayNetworkTypes.js
export type SubscribeFunction = (
  operation: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  observer: any
) => RelayObservable<QueryPayload> | Disposable;
