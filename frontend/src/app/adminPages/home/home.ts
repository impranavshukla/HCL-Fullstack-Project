import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface OverviewMetrics {
  totalUsers: number;
  totalHotels: number;
  totalRooms: number;
  availableRooms: number;
  totalRevenue: number;
  totalBookings: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  adminName = 'Administrator';
  today = new Date();
  isLoading = true;

  metrics = signal<OverviewMetrics>({
    totalUsers: 0,
    totalHotels: 0,
    totalRooms: 0,
    availableRooms: 0,
    totalRevenue: 0,
    totalBookings: 0
  });

  recentBookings = signal<any[]>([]);

  private readonly baseUrl = 'https://localhost:7033/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.adminName = user.full_name || 'Admin';
      } catch (e) {}
    }

    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.isLoading = true;

    forkJoin({
      users: this.http.get<any[]>(`${this.baseUrl}/users`).pipe(catchError(() => of([]))),
      hotels: this.http.get<any[]>(`${this.baseUrl}/hotels`).pipe(catchError(() => of([]))),
      rooms: this.http.get<any[]>(`${this.baseUrl}/rooms`).pipe(catchError(() => of([]))),
      bookings: this.http.get<any[]>(`${this.baseUrl}/bookings`).pipe(catchError(() => of([])))
    }).subscribe({
      next: (results) => {
        try {
          const usersData = Array.isArray(results.users) ? results.users : (results.users as any)?.data || [];
          const hotelsData = Array.isArray(results.hotels) ? results.hotels : (results.hotels as any)?.data || [];
          const roomsData = Array.isArray(results.rooms) ? results.rooms : (results.rooms as any)?.data || [];
          const bookingsData = Array.isArray(results.bookings) ? results.bookings : (results.bookings as any)?.data || [];

          const revenue = bookingsData.reduce((sum: number, b: any) => {
            if (b && (b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending')) {
              return sum + (b.totalAmount || 0);
            }
            return sum;
          }, 0);

          const availableRooms = roomsData.filter((r: any) => r && r.isAvailable).length;

          this.metrics.set({
            totalUsers: usersData.length,
            totalHotels: hotelsData.length,
            totalRooms: roomsData.length,
            availableRooms: availableRooms,
            totalRevenue: revenue,
            totalBookings: bookingsData.length
          });

          const sortedBookings = [...bookingsData].sort((a, b) => {
             const timeA = a?.bookedAt ? new Date(a.bookedAt).getTime() : 0;
             const timeB = b?.bookedAt ? new Date(b.bookedAt).getTime() : 0;
             return timeB - timeA;
          });
          this.recentBookings.set(sortedBookings.slice(0, 5));
        } catch (e) {
          console.error("Dashboard parsing error:", e);
        } finally {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.isLoading = false;
      }
    });
  }
}
