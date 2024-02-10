import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';
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
  private guestApiUrl = 'https://guest-invenia-api.azurewebsites.net/'
  private defaultApiUrl = environment.baseUrl;

  private apiUrlSubject = new BehaviorSubject<string>(this.defaultApiUrl);
  apiUrl$ = this.apiUrlSubject.asObservable();

  constructor(private http: HttpClient, private toastrService: ToastrService) {
    this.handleAPIurl();
  }

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
    return this.http.post<any>(this.apiUrlSubject + 'accounts/auth/', form, httpOptions).pipe(
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
        };
        return user;
      })
    );
  }

  async logInAsGuest() {
    this.apiUrlSubject.next(this.guestApiUrl);
    localStorage.setItem('guestMode', 'true');
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  getUserName(): string | null {
    return localStorage.getItem('user') || 'Guest';
  }

  clearToken(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("is_staff");
    localStorage.removeItem("guestMode");
    this.handleAPIurl();
  }

  setToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  isAuthenticated() {
    return localStorage.getItem("authToken") !== null || localStorage.getItem('guestMode') === 'true';
  }

  handleAPIurl(): void {
    const guestMode = localStorage.getItem('guestMode');
    if (guestMode) {
      this.apiUrlSubject.next(this.guestApiUrl);
    } else {
      this.apiUrlSubject.next(this.defaultApiUrl);
    };
  }

// AuthService class ends here
}

