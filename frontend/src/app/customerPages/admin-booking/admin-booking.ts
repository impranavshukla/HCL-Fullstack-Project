import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Hotel {
  hotelId: number;
  hotelName: string;
  city: string;
  address: string;
}

export interface Room {
  roomId: number;
  roomNumber: string;
  roomType: string;
  hotel?: Hotel;
}

export interface Booking {
  bookingId: number;
  reservationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  bookingStatus: string;
  bookedAt: string;
  room?: Room;
}

@Component({
  selector: 'app-admin-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-booking.html',
  styleUrl: './admin-booking.css'
})
export class AdminBooking implements OnInit {
  bookings = signal<Booking[]>([]);
  isLoading = false;
  
  successMessage = '';
  errorMessage = '';

  private readonly bookingsApiUrl = 'https://localhost:7033/api/bookings';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadMyBookings();
  }

  loadMyBookings() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userStr);
    const customerId = user.user_id;

    if (!customerId) return;

    this.isLoading = true;
    this.http.get<Booking[]>(`${this.bookingsApiUrl}/customer/${customerId}`).subscribe({
      next: (data) => {
        let dt = Array.isArray(data) ? data : (data as any).data || [];
        // Sort bookings by date descending (newest first)
        dt = dt.sort((a: any, b: any) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
        this.bookings.set(dt);
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load your booking history.');
        this.isLoading = false;
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you certain you wish to cancel this reservation? This action cannot be fully undone.')) {
      this.isLoading = true;
      this.http.put(`${this.bookingsApiUrl}/${bookingId}/cancel`, {}).subscribe({
        next: () => {
          this.showSuccess('Your reservation has been cancelled successfully.');
          this.loadMyBookings();
        },
        error: (err) => {
          this.showError('Failed to cancel reservation. Please contact support.');
        }
      });
    }
  }

  getDaysDifference(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    this.errorMessage = '';
    this.isLoading = false;
    setTimeout(() => this.successMessage = '', 4000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.successMessage = '';
    this.isLoading = false;
    setTimeout(() => this.errorMessage = '', 4000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
