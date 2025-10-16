import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID,ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  encapsulation: ViewEncapsulation.None  // <-- add this line
})
export class SignupComponent implements AfterViewInit, OnDestroy {
  name = '';
  email = '';
  password = '';
  strengthPercent = 0;
  strengthLabel = '';

  // Keep references for cleanup
  private resizeHandler = () => {};
  private mousemoveHandler = (e: MouseEvent) => {};
  private mouseleaveHandler = () => {};
  private visibilityHandler = () => {};
  private reduceChangeHandler = (ev: Event) => {};

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onSignup() {
    this.http.post('http://localhost:5000/signup', {
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        if (res?.success) {
          alert(res.message ?? 'Signed up');
          this.router.navigate(['/login']);
        } else {
          alert('Signup failed ❌');
        }
      },
      error: (err) => {
        console.error('Signup error:', err);
        alert('Server error. Please try again later.');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  toggleMotion(ev: Event) {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = ev.target as HTMLInputElement;
    if (target.checked) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }

  updateStrength() {
    const v = this.password || '';
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;

    this.strengthPercent = (s / 4) * 100;
    const labels = ['Very Weak', 'Weak', 'Okay', 'Good', 'Strong'];
    this.strengthLabel = labels[s];
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // ✅ Only run in browser

    const gradEl = document.getElementById('liveGradientSignup') as HTMLElement | null;
    const canvas = document.getElementById('particleCanvasSignup') as HTMLCanvasElement | null;
    const card = document.getElementById('signupCard') as HTMLElement | null;

    if (!gradEl || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    let W = window.innerWidth;
    let H = window.innerHeight;

    // Gradient setup
    let phase = 0;
    const speed = 0.01;
    const cA = [{ r: 255, g: 215, b: 0 }, { r: 30, g: 144, b: 255 }];
    const cB = [{ r: 255, g: 238, b: 89 }, { r: 0, g: 191, b: 255 }];
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const blend = (a: any, bObj: any, t: number) => ({
      r: Math.round(lerp(a.r, bObj.r, t)),
      g: Math.round(lerp(a.g, bObj.g, t)),
      b: Math.round(lerp(a.b, bObj.b, t))
    });

    const updateGrad = () => {
      phase += speed;
      const t = (Math.sin(phase) + 1) / 2;
      const g1 = blend(cA[0], cA[1], t);
      const g2 = blend(cB[0], cB[1], 1 - t);
      gradEl.style.setProperty('--g1', `rgb(${g1.r},${g1.g},${g1.b})`);
      gradEl.style.setProperty('--g2', `rgb(${g2.r},${g2.g},${g2.b})`);
    };

    // Particle setup
    let PARTS = 50;
    let parts: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = [];

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      PARTS = Math.max(12, Math.min(120, Math.floor((W * H) / 120000)));
      parts = [];
      for (let i = 0; i < PARTS; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          r: Math.random() * 1.8 + 0.6
        });
      }
    };
    this.resizeHandler = resize;
    window.addEventListener('resize', this.resizeHandler);
    resize();

    let rx = 0, ry = 0, tz = 0, curX = 0, curY = 0;
    const updateTilt = () => {
      curX += (rx - curX) * 0.12;
      curY += (ry - curY) * 0.12;
      if (card) card.style.transform = `perspective(1000px) rotateX(${curX}deg) rotateY(${curY}deg) translateZ(${tz}px)`;
    };

    this.mousemoveHandler = (e: MouseEvent) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      ry = (dx / r.width) * 10;
      rx = -(dy / r.height) * 6;
      tz = 8;
    };
    this.mouseleaveHandler = () => { rx = 0; ry = 0; tz = 0; };

    document.addEventListener('mousemove', this.mousemoveHandler);
    document.addEventListener('mouseleave', this.mouseleaveHandler);

    this.visibilityHandler = () => {
      if (document.hidden) ctx.clearRect(0, 0, W, H);
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    const loop = () => {
      updateGrad();
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            const alpha = 0.08 * (1 - d / 110);
            ctx.strokeStyle = `rgba(255,240,140,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of parts) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      updateTilt();
      requestAnimationFrame(loop);
    };
    loop();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return; // ✅ Only run in browser
    try {
      window.removeEventListener('resize', this.resizeHandler);
      document.removeEventListener('mousemove', this.mousemoveHandler);
      document.removeEventListener('mouseleave', this.mouseleaveHandler);
      document.removeEventListener('visibilitychange', this.visibilityHandler);

      const reduce = document.getElementById('reduceMotionSignup') as HTMLInputElement | null;
      if (reduce) reduce.removeEventListener('change', this.reduceChangeHandler);
    } catch (err) {
      console.warn('Error cleaning up event listeners', err);
    }
  }
}
