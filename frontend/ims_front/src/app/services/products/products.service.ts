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
  
  handleError(error:any) {
    console.log('See error here:', error.error);
  }

  // SALE BILL
  addMenu(menu: Menu) {
    return this.http.post<Menu>(`${this.apiUrl}menus/`, menu, httpOptions)
      .pipe(
        catchError((error) => {
          this.handleError(error);
          return throwError(() => 'Failed to add new product!');
        })
      );
  }

  getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}menus/`);
  }

  updateMenu(menu: Menu) {
    const url = `${this.apiUrl}menus/` + `${menu.id}/`;
    return this.http.put<Menu>(url, menu, httpOptions)
    .pipe(
      catchError((error) => { 
        this.handleError(error);
        return throwError(() => "Failed to edit product!");
      })
    );
  }

  deleteMenu(menu: Menu) {
    const url = `${this.apiUrl}menus/` + `${menu.id}`;
    return this.http.delete<Menu>(url);
  }

  // SALE ITEM
  addProduct(product: Product) {
    return this.http.post<Product>(`${this.apiUrl}products/`, product, httpOptions)
      .pipe(
        catchError((error) => {
          console.log("Error here:", error.error);
          return throwError(() => 'Failed to add new product!');
        })
      );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}products/`);
  }

  updateProduct(product: Product) {
    const url = `${this.apiUrl}products/` + `${product.id}/`;
    return this.http.put<Product>(url, product, httpOptions)
    .pipe(
      catchError((error) => {
        console.log("Error here:", error.error);
        return throwError(() => "Failed to edit product!");
      })
    );
  }

  deleteProduct(product: Product) {
    const url = `${this.apiUrl}products/` + `${product.id}`;
    return this.http.delete<Product>(url);
  }

}