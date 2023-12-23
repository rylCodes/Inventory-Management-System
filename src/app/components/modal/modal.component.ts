import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() faXmark: any = faXmark; // Font Awesome X mark icon
  @Input() title: string = "";
  @Input() content: string = "";
  @Input() inputType: string = "text";
  @Input() inputField: boolean = false;
  @Input() placeHolder: string = "";
  @Input() btnBgColor: string = "";
  @Input() btnTxtColor: string = "";
  @Input() btnText: string = "Procceed";

  @Output() closeModal = new EventEmitter<void>();
  @Output() valueChanged = new EventEmitter<string>();
  @Output() buttonClick: EventEmitter<void> = new EventEmitter<void>();

  inputValue: string = '';

  onToggleModal() {
    this.closeModal.emit();
  }

  onInputChange(): void {
    this.valueChanged.emit(this.inputValue);
  }

  onClick() {
    this.buttonClick.emit();
  }
}
