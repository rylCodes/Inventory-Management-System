import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/accounts/ims-api/auth/';

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post<any>(this.apiUrl, { username, password }, httpOptions).pipe(
      map((user) => {
        if (user && user.token) {
          localStorage.setItem("currentUser", JSON.stringify(user));
        }
        return user;
      })
    );
  }
  
  logout() {
    localStorage.removeItem('currentUser');
  }

}
