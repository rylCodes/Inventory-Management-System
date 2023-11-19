import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  constructor() { }

  wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateUiid(): string {
    const uuid = uuidv4();
    const prefix = uuid.substring(0, 3);
    return prefix;
  }

  generateSequentialCode(prefix: string, previousItemId?: number): string {
    let sequentialNumber;
    if (previousItemId !== undefined) {
      sequentialNumber = (previousItemId + 1) * 1;
    }

    const currentDate = new Date();
    const yearCode = currentDate.getFullYear().toString().slice(-3);
    const formattedNumber = sequentialNumber?.toString().padStart(4, '0');
    const sequentialCode = `${prefix}-${yearCode}-${formattedNumber}`;
    return sequentialCode;
  }
}
