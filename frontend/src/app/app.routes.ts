import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { CustomerLayout } from './layout/customer-layout/customer-layout';

export const routes: Routes = [

    { path: 'admin', component: AdminLayout },
     { path: 'customer', component: CustomerLayout }
];
