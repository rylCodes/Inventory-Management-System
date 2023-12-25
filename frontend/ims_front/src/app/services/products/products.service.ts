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
  private products: Product[] = [];
  private menus: Menu[] = [];
  private productsSubject: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);
  private menusSubject: BehaviorSubject<Menu[]> = new BehaviorSubject<Menu[]>([]);

  constructor(private http: HttpClient) { }
  
  handleError(err:any) {
    console.log('Error here →', err);
  }

  // SALE BILL
  addMenu(addedMenu: Menu): Observable<Menu> {
    return this.http.post<Menu>(`${this.apiUrl}ims-api/menus/`, addedMenu, httpOptions).pipe(
      tap((menu) => {
        this.menus.push(menu);
        this.menusSubject.next(this.menus.slice());
      }),
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

    if (this.menus.length > 0) {
      return this.menusSubject.asObservable();
    } else {
      return this.http.get<Menu[]>(`${this.apiUrl}ims-api/menus/`, { params }).pipe(
        tap((menus) => {
          this.menus = menus;
          this.menusSubject.next(menus);
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
      tap(() => {
        const index = this.menus.findIndex(menu => menu.id === updatedMenu.id);
        if (index !== -1) {
          this.menus[index] = updatedMenu;
          this.menusSubject.next(this.menus.slice());
        }
      }),
      catchError((err) => { 
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update product!`);
      })
    );
  }

  deleteMenu(deletedMenu: Menu): Observable<Menu> {
    const url = `${this.apiUrl}ims-api/menus/` + `${deletedMenu.id}`;
    return this.http.delete<Menu>(url).pipe(
      tap(() => {
        this.menus = this.menus.filter(menu => menu.id !== deletedMenu.id);
        this.menusSubject.next(this.menus.slice());
      }),
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
      tap((product) => {
        this.products.push(product);
        this.productsSubject.next(this.products.slice());
      }),
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new item!`);
      })
    );
  }

  getProducts(): Observable<Product[]> {
    if (this.products.length > 0) {
      return this.productsSubject.asObservable();
    } else {
      return this.http.get<Product[]>(`${this.apiUrl}ims-api/products/`).pipe(
        tap((products) => {
          this.products = products;
          this.productsSubject.next(products);
        }),
        catchError((err) => {
          this.handleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display items!`);
        })
      );
    }
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    const url = `${this.apiUrl}ims-api/products/` + `${updatedProduct.id}/`;
    return this.http.put<Product>(url, updatedProduct, httpOptions).pipe(
      tap(() => {
        const index = this.products.findIndex(product => product.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
          this.productsSubject.next(this.products.slice());
        }
      }),
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update item!`);
      })
    );
  }

  deleteProduct(deletedProduct: Product): Observable<Product> {
    const url = `${this.apiUrl}ims-api/products/` + `${deletedProduct.id}`;
    return this.http.delete<Product>(url).pipe(
      tap(() => {
        this.products = this.products.filter(product => product.id !== deletedProduct.id);
        this.productsSubject.next(this.products.slice());
      }),
      catchError((err) => {
        this.handleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete item!`);
      })
    );
  }

}