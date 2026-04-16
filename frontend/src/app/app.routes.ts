import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { CustomerLayout } from './layout/customer-layout/customer-layout';
import { Login } from './shared/login/login';
import { Signup } from './shared/signup/signup';

// Admin Pages
import { Home } from './adminPages/home/home';
import { Bookings } from './adminPages/bookings/bookings';
import { Hotels } from './adminPages/hotels/hotels';
import { Rooms } from './adminPages/rooms/rooms';

// Customer Pages
import { AdminHome } from './customerPages/admin-home/admin-home';
import { AdminBooking } from './customerPages/admin-booking/admin-booking';
import { AdminRooms } from './customerPages/admin-rooms/admin-rooms';
import { AdminAboutus } from './customerPages/admin-aboutus/admin-aboutus';
import { Contact } from './customerPages/contact/contact';
import { Profile } from './customerPages/profile/profile';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },

    // Admin Routes
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

    // Customer Routes
    { 
        path: 'customer', 
        component: CustomerLayout,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: AdminHome },
            { path: 'booking', component: AdminBooking },
            { path: 'rooms', component: AdminRooms },
            { path: 'about', component: AdminAboutus },
            { path: 'contact', component: Contact },
            { path: 'profile', component: Profile }
        ]
    },

    // Wildcard - redirect unknown routes to login
    { path: '**', redirectTo: 'login' }
];
