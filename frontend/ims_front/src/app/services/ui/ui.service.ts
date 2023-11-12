import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private showForm: boolean = false;
  private showActionModal: boolean = false;
  private formSubject: Subject<any> = new Subject<any>();
  private actionModalSubject: Subject<any> = new Subject<any>();


  constructor() { }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.formSubject.next(this.showForm);
  }

  onToggleForm(): Observable<any> {
    return this.formSubject.asObservable();
  }

  toggleActionModal(): void {
    this.showActionModal = !this.showActionModal;
    this.actionModalSubject.next(this.showActionModal);
  }

  onToggleActionModal(): Observable<any> {
    return this.actionModalSubject.asObservable();
  }
}
