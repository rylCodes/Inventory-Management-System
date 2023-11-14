import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product } from 'src/app/interface/Product';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:8000/ims-api/products/';

  constructor(private http: HttpClient) { }

  handleProductError(error:any) {
    if (error.error.name) {
      console.log(error.error.name[0]);
    } else if (error.error.code) {
      console.log(error.error.code[0])
    } else {
      console.log('Invalid inputs!');
    }
  }

  addProduct(product: Product) {
    return this.http.post<Product>(this.apiUrl, product, httpOptions)
      .pipe(
        catchError((error) => {
          this.handleProductError(error);
          return throwError(() => 'Failed to add new product!');
        })
      );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  editProduct(product: Product) {
    const url = this.apiUrl + `${product.id}/`;
    return this.http.put<Product>(url, product, httpOptions)
    .pipe(
      catchError((error) => {
        this.handleProductError(error);
        return throwError(() => "Failed to edit product!");
      })
    );
  }

  deleteProduct(product: Product) {
    const url = this.apiUrl + `${product.id}`;
    return this.http.delete<Product>(url);
  }

}