import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject, Subject } from 'rxjs';
import { Notification } from 'src/app/interface/Notification';
import { Stock } from 'src/app/interface/Stock';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = environment.baseUrl
  private notifications = new BehaviorSubject<Notification[]>([]);
  private notifServiceStatusSubject = new Subject<boolean>();

  notifServiceStatus$ = this.notifServiceStatusSubject.asObservable();

  stocks: Stock[] = [];

  constructor(private http: HttpClient) { }

  handleError(err: any): void {
    console.log('Error here →', err);
  }

  addNotification(notification: Notification) {
    return this.http.post<Notification>(`${this.apiUrl}ims-api/notifications/`, notification, httpOptions)
    .pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to add new notification`);
      })
    )
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}ims-api/notifications/`)
    .pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText: 'An error occured'}: Failed to display notifications`);
      })
    );
  }

  fetchNotifications(): BehaviorSubject<Notification[]> {
    this.http.get<Notification[]>(`${this.apiUrl}ims-api/notifications/`).subscribe(
      (notifications: Notification[]) => {this.notifications.next(notifications)}
    )
    return this.notifications;
  }

  deleteNotification(notification: Notification) {
    const url = `${this.apiUrl}ims-api/notifications/` + `${notification.id}`;
    return this.http.delete<Notification>(url)
    .pipe(
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
    this.notifServiceStatusSubject.next(status);
  }
 
}
