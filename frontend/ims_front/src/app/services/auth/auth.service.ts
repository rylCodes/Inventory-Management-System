import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient, private toastrService: ToastrService) { }

  handleLoginError(error: any): void {
    if (error.error.error) {
      console.log("Error here →", error.error.error);
      this.toastrService
      .error(`${error.error.error? error.error.error: "Invalid username or password!"}`);
    } else {
      console.log("Error here →", error.statusText);
      this.toastrService
      .error(`${error.statusText? error.statusText: 'An error'} occured! Please try again later.`);
    }
  }

  login(form: {username: string, password: string}) {
    return this.http.post<any>(this.apiUrl + 'accounts/auth/', form, httpOptions).pipe(
      catchError((error) => {
        if (error) {
          this.handleLoginError(error);
        }
        return throwError(() => {error})}),
      map((user) => {
        if (user && user.token) {
          // const token = JSON.stringify(user.token);
          this.setToken(user.token);
          localStorage.setItem("user", user.first_name);
          localStorage.setItem("is_staff", user.is_staff);
        }
        return user;
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  getUserName(): string | null {
    return localStorage.getItem('user');
  }

  clearToken(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("is_staff");
  }

  setToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  isAuthenticated() {
    return localStorage.getItem("authToken") !== null;
  }

// AuthService class ends here
}

