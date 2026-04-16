import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Hotel {
  hotelId: number;
  hotelName: string;
  city: string;
  address: string;
  rating: number | null;
}

export interface Room {
  roomId: number;
  hotelId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
  amenitiesText: string;
}

@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-rooms.html',
  styleUrl: './admin-rooms.css'
})
export class AdminRooms implements OnInit {
  
  rooms = signal<Room[]>([]);
  hotels = signal<Hotel[]>([]);

  // Filter signal criteria
  filterCriteria = signal({
    city: '',
    type: '',
    maxPrice: null as number | null,
    minCapacity: null as number | null
  });

  // Local model bindings for the UI
  localFilter = {
    city: '',
    type: '',
    maxPrice: null as number | null,
    minCapacity: null as number | null
  };

  filteredRooms = computed(() => {
    let currentRooms = this.rooms().filter(r => r.isAvailable); // customers only see available
    const criteria = this.filterCriteria();

    if (criteria.city) {
      const c = criteria.city.toLowerCase();
      currentRooms = currentRooms.filter(r => {
        const h = this.getHotel(r.hotelId);
        return h && h.city && h.city.toLowerCase().includes(c);
      });
    }
    if (criteria.type) {
      currentRooms = currentRooms.filter(r => r.roomType === criteria.type);
    }
    if (criteria.maxPrice && criteria.maxPrice > 0) {
      currentRooms = currentRooms.filter(r => r.pricePerNight <= criteria.maxPrice!);
    }
    if (criteria.minCapacity && criteria.minCapacity > 0) {
      currentRooms = currentRooms.filter(r => r.capacity >= criteria.minCapacity!);
    }
    return currentRooms;
  });

  selectedRoom: Room | null = null;
  checkInDate: string = '';
  checkOutDate: string = '';
  guestCount: number = 1;
  totalDays: number = 0;
  totalAmount: number = 0;

  isBookingModalOpen = false;
  isLoading = false;
  
  successMessage = '';
  errorMessage = '';

  private readonly roomsApiUrl = 'https://localhost:7033/api/rooms';
  private readonly hotelsApiUrl = 'https://localhost:7033/api/hotels';
  private readonly bookingsApiUrl = 'https://localhost:7033/api/bookings';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadHotels();
    this.loadRooms();
  }

  loadHotels() {
    this.http.get<Hotel[]>(this.hotelsApiUrl).subscribe({
      next: (data) => {
        let dt = Array.isArray(data) ? data : (data as any).data || [];
        this.hotels.set(dt);
      },
      error: () => console.error('Failed to load hotels.')
    });
  }

  loadRooms() {
    this.isLoading = true;
    this.http.get<Room[]>(this.roomsApiUrl).subscribe({
      next: (data) => {
        let dt = Array.isArray(data) ? data : (data as any).data || [];
        this.rooms.set(dt);
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load rooms.');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filterCriteria.set({ ...this.localFilter });
  }

  resetFilters() {
    this.localFilter = { city: '', type: '', maxPrice: null, minCapacity: null };
    this.applyFilters();
  }

  getHotel(hotelId: number): Hotel | undefined {
    return this.hotels().find(h => h.hotelId === hotelId);
  }

  openBookingModal(room: Room) {
    this.selectedRoom = room;
    this.checkInDate = '';
    this.checkOutDate = '';
    this.guestCount = 1;
    this.totalDays = 0;
    this.totalAmount = 0;
    this.isBookingModalOpen = true;
  }

  closeBookingModal() {
    this.isBookingModalOpen = false;
    this.selectedRoom = null;
  }

  calculateTotals() {
    if (this.checkInDate && this.checkOutDate && this.selectedRoom) {
      const start = new Date(this.checkInDate);
      const end = new Date(this.checkOutDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (end <= start) {
        this.totalDays = 0;
        this.totalAmount = 0;
      } else {
        this.totalDays = diffDays;
        this.totalAmount = this.totalDays * this.selectedRoom.pricePerNight;
      }
    }
  }

  onDatesChange() {
    this.calculateTotals();
  }

  submitBooking() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.showError('You must be logged in to book a room.');
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userStr);
    const customerId = user.user_id;

    if (!this.selectedRoom) return;

    if (!this.checkInDate || !this.checkOutDate) {
      this.showError('Please select both Check-in and Check-out dates.');
      return;
    }

    if (new Date(this.checkOutDate) <= new Date(this.checkInDate)) {
      this.showError('Check-out date must be securely after Check-in date.');
      return;
    }

    if (this.guestCount > this.selectedRoom.capacity) {
      this.showError(`Guest count exceeds the room capacity of ${this.selectedRoom.capacity}.`);
      return;
    }

    this.isLoading = true;

    const payload = {
      customerId: customerId,
      roomId: this.selectedRoom.roomId,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      guestCount: this.guestCount,
      totalAmount: this.totalAmount
    };

    this.http.post(this.bookingsApiUrl, payload).subscribe({
      next: (res) => {
        this.showSuccess('Booking confirmed successfully!');
        this.closeBookingModal();
        this.loadRooms();
      },
      error: (err) => {
        const msg = err.error?.message || err.error || 'Failed to complete booking.';
        this.showError(typeof msg === 'string' ? msg : 'An error occurred during booking.');
      }
    });
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
