import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject, Subject } from 'rxjs';
import { Notification } from 'src/app/interface/Notification';
import { Stock } from 'src/app/interface/Stock';

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
  private notifications = new BehaviorSubject<Notification[]>([]);
  private notifServiceStatusSubject = new Subject<boolean>();

  notifServiceStatus$ = this.notifServiceStatusSubject.asObservable();

  stocks: Stock[] = [];

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

  fetchNotifications(): BehaviorSubject<Notification[]> {
    this.http.get<Notification[]>(this.apiUrl).subscribe(
      (notifications: Notification[]) => {this.notifications.next(notifications)}
    )
    return this.notifications;
  }

  deleteNotification(notification: Notification) {
    const url = this.apiUrl + `${notification.id}`;
    return this.http.delete<Notification>(url)
    .pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to delete notification`);
      })
    );
  }

  updateNotification(notif: Notification) {
    const url = this.apiUrl + `${notif.id}/`;
    return this.http.put<Notification>(url, notif, httpOptions);
  }

  setServiceStatus(status: boolean): void {
    this.notifServiceStatusSubject.next(status);
  }
 
}
