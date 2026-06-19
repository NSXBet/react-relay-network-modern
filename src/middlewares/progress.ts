/* eslint-disable no-await-in-loop */

import type {
  MiddlewareRaw,
  RelayRequestAny,
  FetchResponse,
  MiddlewareRawNextFn,
} from '../definition';

export interface ProgressOpts {
  sizeHeader?: string;
  onProgress: (runningTotal: number, totalSize: number | null) => any;
}

function createProgressHandler(opts: ProgressOpts) {
  const { onProgress, sizeHeader = 'Content-Length' } = opts || {};

  return async (res: FetchResponse): Promise<void> => {
    const { body, headers } = res;

    if (!body) {
      return;
    }

    const totalResponseSize = headers.get(sizeHeader);

    let totalSize: number | null = null;
    if (totalResponseSize !== null) {
      totalSize = parseInt(totalResponseSize, 10);
    }

    const reader = body.getReader();

    let completed = false;
    let runningTotal = 0;
    do {
      const step: { value?: any; done: boolean } = await reader.read();
      const { done, value } = step;
      const length = (value && value.length) || 0;

      completed = done;

      if (!completed) {
        runningTotal += length;
        onProgress(runningTotal, totalSize);
      }
    } while (!completed);
  };
}

export default function progressMiddleware(opts: ProgressOpts): MiddlewareRaw {
  const progressHandler = createProgressHandler(opts);

  const mw =
    (next: MiddlewareRawNextFn) =>
    async (req: RelayRequestAny): Promise<FetchResponse> => {
      const res: FetchResponse = await next(req);
      progressHandler(res.clone());
      return res;
    };

  (mw as any).isRawMiddleware = true;
  return mw as unknown as MiddlewareRaw;
}
