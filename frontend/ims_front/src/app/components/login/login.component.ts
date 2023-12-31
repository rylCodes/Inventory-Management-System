import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { catchError, first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UiService } from 'src/app/services/ui/ui.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  title = 'Invenia+';
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private uiService: UiService,
    private toastrService: ToastrService,
    ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (!this.loginForm.get("username")?.value || !this.loginForm.get("password")?.value) {
      // window.alert("Please enter username and password!");
      this.toastrService.error("Please enter username and password!", undefined, {positionClass: 'toast-top-center'})
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.getRawValue())
      .subscribe({
        next: async () => {
          this.isLoading = false;
          this.router.navigate(['']);
          await this.uiService.wait(100);
          this.toastrService.success("You've successfully logged in!", undefined, {positionClass: 'toast-top-center'})
              },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.router.navigate(['login']);
          this.loginForm.reset();
        },
    });
  }
}