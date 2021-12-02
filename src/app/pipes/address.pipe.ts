import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'address',
})
export class AddressPipe implements PipeTransform {
  transform(t: string, size: number): string {
    if (typeof t !== 'string') return '';
    const th = t.slice(0, size);
    const tt = t.slice(t.length - size);
    return th + '..' + tt;
  }
}
