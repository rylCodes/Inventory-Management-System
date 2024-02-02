import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject, Subject, tap } from 'rxjs';
import { Notification } from 'src/app/interface/Notification';
import { Stock } from 'src/app/interface/Stock';
import { environment } from 'src/environments/environment';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private guestApiUrl = 'https://guest-invenia-api.azurewebsites.net/'
  private defaultApiUrl = environment.baseUrl
  private apiUrl: string = '';

  private notifications: Notification[] = [];
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
  private serviceStatusSubject: Subject<boolean> = new Subject<boolean>();
  private hasFetchedData: boolean = false;

  notifServiceStatus$ = this.serviceStatusSubject.asObservable();

  stocks: Stock[] = [];

  constructor(private http: HttpClient) { 
    const guestMode = localStorage.getItem('guestMode');
    if (guestMode) {
      this.apiUrl = this.guestApiUrl;
    } else {
      this.apiUrl = this.defaultApiUrl;
    }
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
