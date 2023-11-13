import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { catchError, first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UiService } from 'src/app/services/ui/ui.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private uiService: UiService,
    ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (!this.loginForm.get("username")?.value || !this.loginForm.get("password")?.value) {
      window.alert("Please enter username and password!");
      return;
    }

    this.authService.login(this.loginForm.getRawValue())
      .pipe(
        catchError(() => {
          return of(null);
        }),
        first(),
      )
      .subscribe(
        async (data) => {
        if (data) {
          console.log(data);
          this.router.navigate(['']);
          await this.uiService.wait(100);
          window.alert("You've successfully logged in!");
        }
        else {
          this.router.navigate(['login']);
          window.alert("Invalid username or password!");
          this.loginForm.reset();
        }
      });
      
  }
}
