import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { CustomerLayout } from './layout/customer-layout/customer-layout';
import { Login } from './shared/login/login';
import { Signup } from './shared/signup/signup';
import { Home } from './adminPages/home/home';
import { Bookings } from './adminPages/bookings/bookings';
import { Hotels } from './adminPages/hotels/hotels';
import { Rooms } from './adminPages/rooms/rooms';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { 
        path: 'admin', 
        component: AdminLayout,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Home },
            { path: 'bookings', component: Bookings },
            { path: 'hotels', component: Hotels },
            { path: 'rooms', component: Rooms }
        ]
    },
    { path: 'customer', component: CustomerLayout }
];
