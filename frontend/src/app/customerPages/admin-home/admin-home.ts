import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Hotel {
  hotelId: number;
  hotelName: string;
  city: string;
  rating: number;
}

interface Room {
  roomId: number;
  hotelId: number;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css'
})
export class AdminHome implements OnInit {
  featuredHotels = signal<Hotel[]>([]);
  featuredRooms = signal<Room[]>([]);
  isLoading = true;

  private readonly hotelsUrl = 'https://localhost:7033/api/hotels';
  private readonly roomsUrl = 'https://localhost:7033/api/rooms';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.http.get<Hotel[]>(this.hotelsUrl).subscribe({
      next: (data) => {
        let dt = Array.isArray(data) ? data : (data as any).data || [];
        this.featuredHotels.set(dt.slice(0, 3));
      }
    });

    this.http.get<Room[]>(this.roomsUrl).subscribe({
      next: (data) => {
        let dt = Array.isArray(data) ? data : (data as any).data || [];
        const available = dt.filter((r: Room) => r.isAvailable);
        // Sort by price descending to explicitly feature "Premium" rooms
        available.sort((a: Room, b: Room) => (b.pricePerNight || 0)  - (a.pricePerNight || 0));
        this.featuredRooms.set(available.slice(0, 3));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
