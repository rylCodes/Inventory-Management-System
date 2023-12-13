import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faIcons, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() showModal: string = "";
  @Input() title: string = "";
  @Input() content: string = "";
  @Input() placeHolder: string = "";
  @Input() btnText: string = "Procceed";
  @Input() btnBgColor: string = "";
  @Input() btnTxtColor: string = "";
  @Input() inputField: string = "false";
  @Output() btnClick = new EventEmitter();
  @Output() toggleModal = new EventEmitter();
  @Output() inputValueChange = new EventEmitter<string>();
  
  faXmark = faXmark;

  onToggleModal() {
    this.toggleModal.emit();
  }

  onClick() {
    this.btnClick.emit();
  }


  onInputChange(inputValue: string): void {
    // Emit the input value in real-time
    this.inputValueChange.emit(inputValue);
  }
}
