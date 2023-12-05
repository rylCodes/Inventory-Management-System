import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product } from 'src/app/interface/Product';
import { Menu } from 'src/app/interface/Product';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:8000/ims-api/';

  constructor(private http: HttpClient) { }
  
  handleError(err:any) {
    console.log('Error here →', err);
  }

  // SALE BILL
  addMenu(menu: Menu) {
    return this.http.post<Menu>(`${this.apiUrl}menus/`, menu, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new product!`);
        })
      );
  }

  getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}menus/`)
      .pipe(
        catchError((err) => {
          this.handleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display menu!`)
        })
      );
  }

  updateMenu(menu: Menu) {
    const url = `${this.apiUrl}menus/` + `${menu.id}/`;
    return this.http.put<Menu>(url, menu, httpOptions)
    .pipe(
      catchError((err) => { 
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update product!`);
      })
    );
  }

  deleteMenu(menu: Menu) {
    const url = `${this.apiUrl}menus/` + `${menu.id}`;
    return this.http.delete<Menu>(url)
      .pipe(
        catchError((err) => {
          this.handleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete product!`);
        })
      );
  }

  // SALE ITEM
  addProduct(product: Product) {
    return this.http.post<Product>(`${this.apiUrl}products/`, product, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new item!`);
        })
      );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}products/`)
      .pipe(
        catchError((err) => {
          this.handleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display items!`);
        })
      );
  }

  updateProduct(product: Product) {
    const url = `${this.apiUrl}products/` + `${product.id}/`;
    return this.http.put<Product>(url, product, httpOptions)
    .pipe(
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update item!`);
      })
    );
  }

  deleteProduct(product: Product) {
    const url = `${this.apiUrl}products/` + `${product.id}`;
    return this.http.delete<Product>(url)
      .pipe(
        catchError((err) => {
          this.handleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete item!`);
        })
      );
  }

}