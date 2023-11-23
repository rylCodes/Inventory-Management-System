import { Directive, ElementRef, HostListener, } from '@angular/core';

@Directive({
  selector: '[appSelectAllText]'
})
export class SelectAllTextDirective {

  constructor(private el: ElementRef) { }

  @HostListener('focus', ['$event.target'])
  selectAllText(input: HTMLInputElement): void {
    input.select();
  }

}
