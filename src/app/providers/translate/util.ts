import { IonicSafeString } from '@ionic/angular';
import { isObject } from 'lodash';

export function GenericClass<Props>(): new () => Props {
  return class {} as any;
}

function concatIfExistsPath(path: string, suffix: string): string {
  return path ? `${path}.${suffix}` : suffix;
}

export function transformObjectToPath<T extends object | string>(
  suffix: string,
  objectToTransformOrEndOfPath: T,
  path = '',
): T {
  return typeof objectToTransformOrEndOfPath === 'object'
    ? Object.entries(objectToTransformOrEndOfPath).reduce((objectToTransform, [key, value]) => {
        objectToTransform[key] = transformObjectToPath(
          key,
          value,
          concatIfExistsPath(path, suffix),
        );

        return objectToTransform;
      }, {} as T)
    : (concatIfExistsPath(path, suffix) as T);
}

export function sanitizeExtendedInput(
  message: string | string[] | object,
): IonicSafeString | IonicSafeString[] {
  if (typeof message === 'string') {
    return new IonicSafeString(message);
  }
  if (Array.isArray(message)) {
    return message.map(part => new IonicSafeString(part));
  }
  if (typeof message === 'object') {
    return new IonicSafeString(JSON.stringify(message));
  }
}

export function fillString(source: string, ...keyval: Array<[string, any]>): string {
  let s = source;
  keyval.forEach(([key, val]) => {
    s = s.replace(`<${key.toUpperCase()}>`, JSON.stringify(val));
  });

  return s;
}
