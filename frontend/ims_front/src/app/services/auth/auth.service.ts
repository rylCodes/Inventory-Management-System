import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { UserDetails } from 'src/app/interface/UserDetails';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/';
  currentUser!: UserDetails;
  userDetails!: UserDetails[];

  constructor(private http: HttpClient) { }

  private handleError() {
    const errorMessage = `Invalid data!`;
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }

  storeToken(userDetails: UserDetails) {
    return this.http.post<UserDetails>(this.apiUrl + 'user-access/authenticated/', userDetails ,httpOptions);
  }

  getToken(): Observable<UserDetails[]> {
    return this.http.get<UserDetails[]>(this.apiUrl + "user-access/authenticated/");
  }

  deleteToken(userDetails: UserDetails): Observable<UserDetails> {
    return this.http.delete<UserDetails>(this.apiUrl + "user-access/authenticated/" + `${userDetails.id}`);
  }

  login(form: {username: string, password: string}) {
    return this.http.post<any>(this.apiUrl + 'accounts/auth/', form, httpOptions).pipe(
      catchError(this.handleError),
      map((user) => {
        if (user && user.token) {
          this.currentUser = user; 
          console.log(this.currentUser);
          this.storeToken(this.currentUser).subscribe();
          window.alert("Logged in successfully!")
          return user;
        } 
      })
    );
  }

  logout() {
    this.getToken().subscribe(userDetails => {
      this.userDetails = userDetails;
      this.deleteToken(this.userDetails[0]).subscribe();
    }); 
  }

  isAuthenticated() {
    this.getToken().subscribe(userDetails => this.userDetails = userDetails);
    return this.userDetails.length > 0;
  }

// AuthService class ends here
}

