import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject, Subject, tap } from 'rxjs';
import { Notification } from 'src/app/interface/Notification';
import { Stock } from 'src/app/interface/Stock';
import { environment } from 'src/environments/environment';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { AuthService } from '../auth/auth.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl: string = '';

  private serviceStatusSubject: Subject<boolean> = new Subject<boolean>();
  notifServiceStatus$ = this.serviceStatusSubject.asObservable();

  stocks: Stock[] = [];

  constructor(private http: HttpClient, private authService: AuthService) { 
    this.authService.apiUrl$.subscribe(apiUrl => this.apiUrl = apiUrl);
  }

  handleError(err: any): void {
    console.log('Error here →', err);
  }

  addNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}ims-api/notifications/`, notification, httpOptions).pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to add new notification`);
      })
    )
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}ims-api/notifications/`).pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to display notifications`);
      })
    );
  }

  deleteNotification(notification: Notification): Observable<Notification> {
    const url = `${this.apiUrl}ims-api/notifications/` + `${notification.id}`;
    return this.http.delete<Notification>(url).pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to delete notification`);
      })
    );
  }

  updateNotification(notif: Notification) {
    const url = `${this.apiUrl}ims-api/notifications/` + `${notif.id}/`;
    return this.http.put<Notification>(url, notif, httpOptions);
  }

  setServiceStatus(status: boolean): void {
    this.serviceStatusSubject.next(status);
  }
 
}
