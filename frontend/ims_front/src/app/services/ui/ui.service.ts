import { sequence } from '@angular/animations';
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
    const sequentialPart = uuid.substring(0, 4);
    return sequentialPart;
  }

  generateSequentialCode(prefix: string, id: number): string {
     const multiplier = 1000;
    const sequentialCode = `${prefix}-${multiplier * id}`;
    return sequentialCode;
  }
}
