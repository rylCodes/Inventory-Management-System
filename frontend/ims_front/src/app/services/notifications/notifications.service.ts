import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Notification } from 'src/app/interface/Notification';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = 'http://localhost:8000/ims-api/notifications/'

  constructor(private http: HttpClient) { }

  handleError(err: any): void {
    console.log('Error here →', err);
  }

  addNotification(notification: Notification) {
    return this.http.post<Notification>(this.apiUrl, notification, httpOptions)
    .pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to add new notification`);
      })
    )
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl)
    .pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to display notifications`);
      })
    );
  }

  deleteNotification(notification: Notification) {
    const url = `${this.apiUrl}` + `${notification.id}`;
    return this.http.delete<Notification>(url)
    .pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to delete notification`);
      })
    );
  }
 
}
