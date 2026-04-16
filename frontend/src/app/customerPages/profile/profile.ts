import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserProfile {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  profile_image_url?: string;
  created_at?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user = signal<UserProfile | null>(null);

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        this.user.set(parsedUser);
      } catch (e) {
        console.error("Failed to parse user data from local storage.");
      }
    }
  }

  getAvatarUrl(): string {
    const u = this.user();
    if (u && u.profile_image_url) {
      return u.profile_image_url;
    }
    const name = u ? u.full_name.replace(' ', '+') : 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=c19b76&color=fff&size=200`;
  }
}
