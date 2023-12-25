import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError, tap } from 'rxjs';
import { Product } from 'src/app/interface/Product';
import { Menu } from 'src/app/interface/Product';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = environment.baseUrl;
  private menus: Menu[] = [];
  private menusSubject: BehaviorSubject<Menu[]> = new BehaviorSubject<Menu[]>([]);
  private hasFetchedBills: boolean = false;

  constructor(private http: HttpClient) { }
  
  handleError(err:any) {
    console.log('Error here →', err);
  }

  // SALE BILL
  addMenu(addedMenu: Menu): Observable<Menu> {
    return this.http.post<Menu>(`${this.apiUrl}ims-api/menus/`, addedMenu, httpOptions).pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new product!`);
      })
    );
  }

  getMenus(searchQuery?: string): Observable<Menu[]> {
    let params = new HttpParams;
    if (searchQuery) {
      params = params.set('search', searchQuery)
    };

    if (this.hasFetchedBills) {
      return this.menusSubject.asObservable();
    } else {
      return this.http.get<Menu[]>(`${this.apiUrl}ims-api/menus/`, { params }).pipe(
        tap((menus) => {
          this.menus = menus;
          this.menusSubject.next(menus);
          this.hasFetchedBills = true;
        }),
        catchError((err) => {
          this.handleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display menu!`)
        })
      );
    }
  }

  updateMenu(updatedMenu: Menu): Observable<Menu> {
    const url = `${this.apiUrl}ims-api/menus/` + `${updatedMenu.id}/`;
    return this.http.put<Menu>(url, updatedMenu, httpOptions).pipe(
      catchError((err) => { 
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update product!`);
      })
    );
  }

  deleteMenu(deletedMenu: Menu): Observable<Menu> {
    const url = `${this.apiUrl}ims-api/menus/` + `${deletedMenu.id}`;
    return this.http.delete<Menu>(url).pipe(
      catchError((err) => {
        this.handleError(err);
        if (err.error.error) {  
          return throwError(() => err.error.error? err.error.error : 'Unable to delete product!');
        }
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete product!`);
      })
    );
  }

  // SALE ITEM
  addProduct(addedProduct: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}ims-api/products/`, addedProduct, httpOptions).pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new item!`);
      })
    );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}ims-api/products/`).pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display items!`);
      })
    );
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    const url = `${this.apiUrl}ims-api/products/` + `${updatedProduct.id}/`;
    return this.http.put<Product>(url, updatedProduct, httpOptions).pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update item!`);
      })
    );
  }

  deleteProduct(deletedProduct: Product): Observable<Product> {
    const url = `${this.apiUrl}ims-api/products/` + `${deletedProduct.id}`;
    return this.http.delete<Product>(url).pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete item!`);
      })
    );
  }

}