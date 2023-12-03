import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DatePipe } from '@angular/common';

import { authGuard } from './guard/auth.guard';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { StocksComponent } from './components/stocks/stocks.component';
import { ProductsComponent } from './components/products/products.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ButtonComponent } from './components/button/button.component';
import { PosComponent } from './components/pos/pos.component';
import { PurchasesComponent } from './components/purchases/purchases.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { SelectAllTextDirective } from './directives/select-all-text/select-all-text.directive';
import { FocusOnShowDirective } from './directives/focus-on-show/focus-on-show.directive';
import { SalesComponent } from './components/sales/sales.component';
import { AuthService } from './services/auth/auth.service';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { NgxPrintModule } from 'ngx-print';

const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: '', component: DashboardComponent, canActivate: [authGuard]},
  {path: 'stocks', component: StocksComponent, canActivate: [authGuard]},
  {path: 'products', component: ProductsComponent, canActivate: [authGuard]},
  {path: 'pos', component: PosComponent, canActivate: [authGuard]},
  {path: 'suppliers', component: SuppliersComponent, canActivate: [authGuard]},
  {path: 'purchases', component: PurchasesComponent, canActivate: [authGuard]},
  {path: 'sales', component: SalesComponent, canActivate: [authGuard]},
]

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HeaderComponent,
    StocksComponent,
    LoginComponent,
    DashboardComponent,
    ButtonComponent,
    PosComponent,
    ProductsComponent,
    PurchasesComponent,
    SuppliersComponent,
    SelectAllTextDirective,
    FocusOnShowDirective,
    SalesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgxPrintModule,
  ],
  providers: [
    DatePipe,
    AuthService,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
