export function isFunction(obj: any): obj is (...args: any[]) => any {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}
