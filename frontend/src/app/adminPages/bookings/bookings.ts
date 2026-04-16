import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
  bookings = signal<any[]>([]);
  searchQuery = signal<string>('');
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private readonly apiUrl = 'https://localhost:7033/api/bookings';

  // Derived signal for filtering bookings based on search
  filteredBookings = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.bookings();
    return this.bookings().filter(b => 
      (b.reservationNumber && b.reservationNumber.toLowerCase().includes(q)) ||
      (b.customer?.full_name && b.customer.full_name.toLowerCase().includes(q)) ||
      (b.room?.hotel?.hotelName && b.room.hotel.hotelName.toLowerCase().includes(q))
    );
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchBookings();
  }

  fetchBookings() {
    this.isLoading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        let dt = Array.isArray(data) ? data : (data as any).data || [];
        // Sort explicitly by latest bookings first
        dt.sort((a: any, b: any) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
        this.bookings.set(dt);
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load system bookings.');
        this.isLoading = false;
      }
    });
  }

  updateSearch(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.searchQuery.set(input);
  }

  cancelBooking(id: number) {
    if (confirm('Are you sure you want to officially cancel this reservation? The room will be made available again.')) {
      this.isLoading = true;
      this.http.put(`${this.apiUrl}/${id}/cancel`, {}).subscribe({
        next: () => {
          this.showSuccess('Booking state set to Cancelled. Room stock released.');
          this.fetchBookings();
        },
        error: () => {
          this.showError('Unable to formally cancel booking.');
          this.isLoading = false;
        }
      });
    }
  }

  deleteRecord(id: number) {
    if (confirm('WARNING: Are you sure you want to permanently DELETE this booking record from the database? This is a destructive action.')) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.showSuccess('Reservation database record completely destroyed.');
          this.fetchBookings();
        },
        error: () => {
          this.showError('Failed to erase booking record.');
          this.isLoading = false;
        }
      });
    }
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 4000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 4000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
