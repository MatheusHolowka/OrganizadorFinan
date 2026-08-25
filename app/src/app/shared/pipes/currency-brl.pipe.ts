import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBrl',
  standalone: true,
})
export class CurrencyBrlPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showSymbol: boolean = true): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return showSymbol ? 'R$ 0,00' : '0,00';
    }

    const num = Number(value);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

    return showSymbol ? formatted : formatted.replace('R$', '').trim();
  }
}
