import { Component, OnInit } from '@angular/core';
import { PublicService } from 'src/app/services/public/public.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css']
})
export class PublicComponent implements OnInit {
  msg: any;

  constructor(private publicService: PublicService) {}

  ngOnInit(): void {
    this.publicService
      .getMessage()
      .subscribe((msg) => (this.msg = msg, console.log(this.msg)));
  }
}
