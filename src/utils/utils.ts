export function shallowEqual(
  object1: object,
  object2: object,
  except: [string],
): boolean {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length + except.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (except.indexOf(key) >= 0) continue;
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
}
