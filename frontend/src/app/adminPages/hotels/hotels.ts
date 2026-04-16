import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Hotel {
  hotelId?: number;
  hotelName: string;
  city: string;
  address: string;
  description: string;
  rating: number | null;
  createdAt?: string;
}

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotels.html',
  styleUrl: './hotels.css'
})
export class Hotels implements OnInit {
  hotels = signal<Hotel[]>([]);
  currentHotel: Hotel = {
    hotelName: '',
    city: '',
    address: '',
    description: '',
    rating: null
  };
  
  isEditing = false;
  isLoading = false;
  
  successMessage = '';
  errorMessage = '';

  private readonly apiUrl = 'https://localhost:7033/api/hotels';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadHotels();
  }

  loadHotels() {
    this.isLoading = true;
    this.http.get<Hotel[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.hotels.set(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.showError('Failed to load hotels.');
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (!this.currentHotel.hotelName || !this.currentHotel.city || !this.currentHotel.address) {
      this.showError('Please fill in all required fields (Name, City, Address).');
      return;
    }

    this.isLoading = true;
    
    // Ensure rating is explicitly sent as a number if valid, or null.
    if(this.currentHotel.rating) {
        this.currentHotel.rating = Number(this.currentHotel.rating);
    } else {
        this.currentHotel.rating = null;
    }

    if (this.isEditing && this.currentHotel.hotelId) {
      // Update
      this.http.put(`${this.apiUrl}/${this.currentHotel.hotelId}`, this.currentHotel).subscribe({
        next: () => {
          this.showSuccess('Hotel updated successfully.');
          this.loadHotels();
          this.resetForm();
        },
        error: () => this.showError('Failed to update hotel.')
      });
    } else {
      // Create
      this.http.post(this.apiUrl, this.currentHotel).subscribe({
        next: () => {
          this.showSuccess('Hotel created successfully.');
          this.loadHotels();
          this.resetForm();
        },
        error: () => this.showError('Failed to create hotel.')
      });
    }
  }

  editHotel(hotel: Hotel) {
    this.isEditing = true;
    this.currentHotel = { ...hotel };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteHotel(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.showSuccess('Hotel deleted successfully.');
          this.loadHotels();
        },
        error: () => this.showError('Failed to delete hotel.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentHotel = {
      hotelName: '',
      city: '',
      address: '',
      description: '',
      rating: null
    };
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    this.errorMessage = '';
    this.isLoading = false;
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.successMessage = '';
    this.isLoading = false;
    setTimeout(() => this.errorMessage = '', 3000);
  }
}
