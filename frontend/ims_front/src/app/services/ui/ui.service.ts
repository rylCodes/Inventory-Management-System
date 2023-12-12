import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  constructor(private toastrService: ToastrService) { }  

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

  displayErrorMessage(err: any): void {
    console.log("Error here →", err);
    this.toastrService
    .error(
      err? err: "Unknow error occured! Please try again later.",
      undefined,
      {positionClass: 'toast-top-center'}
    ); 
  } 
}
