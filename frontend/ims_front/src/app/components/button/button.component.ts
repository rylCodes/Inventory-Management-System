import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() txtContent: string = "";
  @Input() bgColor: string = "";
  @Input() txtColor: string = "";
  @Output() btnClick = new EventEmitter();

  onClick() {
    this.btnClick.emit();
  }
}
