import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Signup {
signupForm: FormGroup;
  apiErrorMessage = '';
  apiSuccessMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.pattern('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-zA-Z0-9]).{8,}$')
      ]],
      fullName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      address: ['', [Validators.required]],
      country: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,14}$')]]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.http.post('http://localhost:3000/api/users', this.signupForm.value)
        .subscribe({
          next: () => { this.apiSuccessMessage = "User registered successfully!" },
          error: err => { this.apiErrorMessage = err.error.message || 'Sign up failed.' }
        });
    }
  }
}
