import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Hotel {
  hotelId: number;
  hotelName: string;
}

export interface Room {
  roomId?: number;
  hotelId: number;
  hotel?: Hotel;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
  amenitiesText: string;
  createdAt?: string;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css'
})
export class Rooms implements OnInit {
  rooms = signal<Room[]>([]);
  hotels = signal<Hotel[]>([]);
  
  currentRoom: Room = {
    hotelId: 0,
    roomNumber: '',
    roomType: '',
    pricePerNight: 0,
    capacity: 1,
    isAvailable: true,
    amenitiesText: ''
  };
  
  isEditing = false;
  isLoading = false;
  
  successMessage = '';
  errorMessage = '';

  private readonly roomsApiUrl = 'https://localhost:7033/api/rooms';
  private readonly hotelsApiUrl = 'https://localhost:7033/api/hotels';

  constructor(private http: HttpClient) {}

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
      error: () => {
        this.showError('Failed to load hotels for dropdown.');
      }
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

  onSubmit() {
    if (!this.currentRoom.hotelId || !this.currentRoom.roomNumber || !this.currentRoom.roomType || !this.currentRoom.pricePerNight || !this.currentRoom.capacity) {
      this.showError('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    
    this.currentRoom.hotelId = Number(this.currentRoom.hotelId);
    this.currentRoom.pricePerNight = Number(this.currentRoom.pricePerNight);
    this.currentRoom.capacity = Number(this.currentRoom.capacity);

    if (this.isEditing && this.currentRoom.roomId) {
      this.http.put(`${this.roomsApiUrl}/${this.currentRoom.roomId}`, this.currentRoom).subscribe({
        next: () => {
          this.showSuccess('Room updated successfully.');
          this.loadRooms();
          this.resetForm();
        },
        error: () => this.showError('Failed to update room.')
      });
    } else {
      this.http.post(this.roomsApiUrl, this.currentRoom).subscribe({
        next: () => {
          this.showSuccess('Room created successfully.');
          this.loadRooms();
          this.resetForm();
        },
        error: () => this.showError('Failed to create room.')
      });
    }
  }

  editRoom(room: Room) {
    this.isEditing = true;
    this.currentRoom = { ...room };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteRoom(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this room?')) {
      this.isLoading = true;
      this.http.delete(`${this.roomsApiUrl}/${id}`).subscribe({
        next: () => {
          this.showSuccess('Room deleted successfully.');
          this.loadRooms();
        },
        error: () => this.showError('Failed to delete room.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentRoom = {
      hotelId: 0,
      roomNumber: '',
      roomType: '',
      pricePerNight: 0,
      capacity: 1,
      isAvailable: true,
      amenitiesText: ''
    };
  }

  getHotelName(hotelId: number): string {
    const matched = this.hotels().find(h => h.hotelId === hotelId);
    return matched ? matched.hotelName : 'Unknown Hotel';
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
