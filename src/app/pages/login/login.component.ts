import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',   // ensure the file name is correct
  styleUrls: ['./login.component.css'],    // ✅ array, plural
  encapsulation: ViewEncapsulation.None    // ✅ makes CSS apply globally for this component
})

export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    this.http.post('http://localhost:5000/login', {
      email: this.email,
      password: this.password
    }).subscribe((res: any) => {
      if (res.success) {
        alert(res.message);
        this.router.navigate(['/home']);
      } else {
        alert(res.message);
      }
    });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
