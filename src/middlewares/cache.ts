import { QueryResponseCache } from 'relay-runtime';
import type { Middleware } from '../definition';
import { isFunction } from '../utils';

export interface CacheMiddlewareOpts {
  size?: number;
  ttl?: number;
  onInit?: (cache: QueryResponseCache) => any;
  allowMutations?: boolean;
  allowFormData?: boolean;
  clearOnMutation?: boolean;
  cacheErrors?: boolean;
  updateTTLOnGet?: boolean;
}

export default function cacheMiddleware(opts?: CacheMiddlewareOpts): Middleware {
  const {
    size,
    ttl,
    onInit,
    allowMutations,
    allowFormData,
    clearOnMutation,
    cacheErrors,
    updateTTLOnGet,
  } = opts || {};
  const cache = new QueryResponseCache({
    size: size || 100, // 100 requests
    ttl: ttl || 15 * 60 * 1000, // 15 minutes
  });

  if (isFunction(onInit)) {
    onInit(cache);
  }

  return (next) => async (req) => {
    if (req.isMutation()) {
      if (clearOnMutation) {
        cache.clear();
      }
      if (!allowMutations) {
        return next(req);
      }
    }

    if (req.isFormData() && !allowFormData) {
      return next(req);
    }

    const cacheConfig = (req as any).cacheConfig;
    if (cacheConfig && cacheConfig.force) {
      const queryId = req.getID();
      const variables = req.getVariables();
      const res = await next(req);

      if (!res.errors || (res.errors && cacheErrors)) {
        cache.set(queryId, variables, res as any);
      }
      return res;
    }

    try {
      const queryId = req.getID();
      const variables = req.getVariables();

      const cachedRes = cache.get(queryId, variables);
      if (cachedRes) {
        if (updateTTLOnGet) {
          cache.set(queryId, variables, cachedRes);
        }

        return cachedRes as any;
      }

      const res = await next(req);
      if (!res.errors || (res.errors && cacheErrors)) {
        cache.set(queryId, variables, res as any);
      }

      return res;
    } catch (e) {
      // if error, just log it to console
      console.log(e); // eslint-disable-line
    }

    return next(req);
  };
}
