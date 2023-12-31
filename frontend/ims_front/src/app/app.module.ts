import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule } from 'ngx-toastr';
import { NgxPrintModule } from 'ngx-print';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from 'ngx-pagination';
import { ChartModule } from 'angular-highcharts';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { authGuard } from './guard/auth.guard';
import { AuthService } from './services/auth/auth.service';
import { AuthInterceptor } from './interceptor/auth.interceptor';

import { SelectAllTextDirective } from './directives/select-all-text/select-all-text.directive';
import { FocusOnShowDirective } from './directives/focus-on-show/focus-on-show.directive';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { StocksComponent } from './components/stocks/stocks.component';
import { ProductsComponent } from './components/products/products.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PosComponent } from './components/pos/pos.component';
import { PurchasesComponent } from './components/purchases/purchases.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { SalesComponent } from './components/sales/sales.component';
import { AboutComponent } from './components/about/about.component';
import { LoaderComponent } from './components/loader/loader.component';
import { ModalComponent } from './components/modal/modal.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ChartsComponent } from './components/charts/charts.component';

const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: '', component: DashboardComponent, canActivate: [authGuard]},
  {path: 'stocks', component: StocksComponent, canActivate: [authGuard]},
  {path: 'products', component: ProductsComponent, canActivate: [authGuard]},
  {path: 'pos', component: PosComponent, canActivate: [authGuard]},
  {path: 'suppliers', component: SuppliersComponent, canActivate: [authGuard]},
  {path: 'purchases', component: PurchasesComponent, canActivate: [authGuard]},
  {path: 'sales', component: SalesComponent, canActivate: [authGuard]},
  {path: 'about', component: AboutComponent, canActivate: [authGuard]},
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
    PosComponent,
    ProductsComponent,
    PurchasesComponent,
    SuppliersComponent,
    SelectAllTextDirective,
    FocusOnShowDirective,
    SalesComponent,
    AboutComponent,
    LoaderComponent,
    ModalComponent,
    SearchBarComponent,
    ChartsComponent,
  ],
  imports: [
    MatIconModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes, { useHash: true }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgxPrintModule,
    BrowserAnimationsModule,
    NgxPaginationModule,
    ChartModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      closeButton: true,
      // progressBar: true,
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
      timeOut: 3000,
    }),
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
