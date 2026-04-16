import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  user = {
    full_name: '',
    email: '',
    password_hash: '',
    role: '',
    profile_image_url: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (!this.user.full_name || !this.user.email || !this.user.password_hash || !this.user.role) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('https://localhost:7033/api/users', this.user).subscribe({
      next: (response) => {
        this.successMessage = 'Account created successfully! Redirecting to login...';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to create account. Please ensure the backend is running and details are correct.';
        this.isLoading = false;
        console.error('Signup error', error);
      }
    });
  }
}
