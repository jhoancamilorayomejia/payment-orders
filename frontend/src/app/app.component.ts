import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

/**
 * AppComponent
 *
 * Responsabilidad dentro del sistema:
 * - Gestiona el flujo principal de la aplicación, incluyendo inicio de sesión
 *   de usuarios y redirección según el rol (ADMIN o OPERATOR).
 * - Maneja la persistencia de la sesión mediante tokens JWT y verifica su expiración.
 * - Controla la apertura/cierre del modal de órdenes aprobadas y la obtención
 *   de los datos desde el backend.
 * - Permite el registro de nuevos usuarios desde el formulario de la pantalla principal.
 *
 * Relación con otros componentes:
 * - Se comunica con el backend a través de HTTP para login, registro y recuperación de órdenes.
 * - Interactúa con rutas de Angular (Router) para redireccionar según rol.
 * - Funciona en conjunto con AuthGuard y tokenInterceptor para seguridad de rutas.
 *
 * Por qué existe dentro de la solución:
 * Centraliza la gestión de sesión, navegación y acceso a los datos globales
 * de órdenes aprobadas, sirviendo como punto de entrada principal de la app.
 */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  // ── Login ──────────────────────────────────────────────
  email: string = '';
  password: string = '';
  message: string = '';
  isLoggedIn = false;

  // ── Modal de órdenes ───────────────────────────────────
  isOrdersModalOpen = false;
  orders: OrderData[] = [];

  // ── UI: tab activo ─────────────────────────────────────
  activeTab: string = 'login';

  // ── Nav scroll effect ──────────────────────────────────
  isScrolled = false;

  // ── Registro: campos del formulario ───────────────────
  regNombre:   string = '';
  regApellido: string = '';
  regEmail:    string = '';
  regEmpresa:  string = '';
  regTipo:     string = '';
  regPassword: string = '';
  regTerms:    boolean = false;

  // ── Registro: mensajes de feedback ────────────────────
  registerMessage: string = '';
  registerError:   boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  // ═══════════════════════════════════════════════════════
  // LIFECYCLE HOOKS
  // ═══════════════════════════════════════════════════════

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.isLoggedIn = true;

      const role = localStorage.getItem('role');

      if (role === 'ADMIN') {
        this.router.navigate(['/dashboard']);
      }

      if (role === 'OPERATOR') {
        this.router.navigate(['/operator']);
      }
    }

    // Revisar expiración del token constantemente
    setInterval(() => {
      this.checkTokenExpiration();
    }, 1000);
  }

  ngAfterViewInit(): void {
    // Solo inicializar animaciones si el usuario NO está logueado
    // (la landing solo se muestra cuando isLoggedIn = false)
    if (!this.isLoggedIn) {
      // Pequeño delay para que Angular termine de renderizar el DOM
      setTimeout(() => {
        this.initParticles();
        this.initScrollReveal();
        this.initNavScroll();
      }, 50);
    }
  }

  // ═══════════════════════════════════════════════════════
  // ANIMACIONES — Prisma Motion Design
  // ═══════════════════════════════════════════════════════

  /**
   * Crea un canvas de partículas flotantes (puntos dorados/blancos
   * conectados por líneas tenues) que cubre toda la página.
   */
  private initParticles(): void {
    const canvas = document.getElementById('particlesCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar tamaño al viewport y re-ajustar al redimensionar
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number; opacity: number;
      color: string;
    }

    const GOLD  = 'rgba(201,169,110,';
    const WHITE = 'rgba(200,200,230,';

    // Generar partículas con propiedades aleatorias
    const particles: Particle[] = Array.from({ length: 55 }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      vx:      (Math.random() - 0.5) * 0.4,
      vy:      (Math.random() - 0.5) * 0.4,
      size:    Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.4 + 0.05,
      color:   Math.random() > 0.55 ? GOLD : WHITE,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mover y dibujar cada partícula
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap-around en bordes
        if (p.x < 0)             p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0)             p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.fill();
      });

      // Dibujar líneas entre partículas cercanas (< 100px)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = GOLD + (0.06 * (1 - dist / 100)) + ')';
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Usa IntersectionObserver para activar la animación CSS `reveal-up`
   * solo cuando el elemento entra en el viewport (scroll reveal).
   */
  private initScrollReveal(): void {
    const elements = document.querySelectorAll('.reveal-up');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animationPlayState = 'running';
          observer.unobserve(entry.target); // Solo animar una vez
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(el => {
      // Pausar la animación hasta que el elemento sea visible
      (el as HTMLElement).style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

  /**
   * Escucha el scroll de la ventana para activar el efecto
   * de nav oscurecido + borde dorado (clase `nav-scrolled`).
   */
  private initNavScroll(): void {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 40;
    });
  }

  // ═══════════════════════════════════════════════════════
  // LÓGICA DE NEGOCIO (sin cambios)
  // ═══════════════════════════════════════════════════════

  // ── Scroll suave hacia una sección por ID ──────────────
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── Login ──────────────────────────────────────────────
  login(): void {
    const body = { email: this.email, password: this.password };

    this.http.post<{ success: boolean; message: string; rol: string; token: string }>(
      '/api/auth/login', body
    ).subscribe({
      next: (res) => {
        if (res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.rol);

          this.isLoggedIn = true;

          if (res.rol === 'ADMIN') {
            this.router.navigate(['/dashboard']);
          }

          if (res.rol === 'OPERATOR') {
            this.router.navigate(['/operator']);
          }
        } else {
          this.message = res.message;
        }
      },
      error: () => {
        this.message = 'Error de conexión con el servidor';
      }
    });
  }

  // ── Registro de nuevo usuario ──────────────────────────
  register(): void {
    this.registerMessage = '';
    this.registerError   = false;

    if (!this.regNombre || !this.regApellido || !this.regEmail ||
        !this.regEmpresa || !this.regTipo || !this.regPassword) {
      this.registerMessage = 'Por favor completa todos los campos.';
      this.registerError   = true;
      return;
    }

    if (!this.regTerms) {
      this.registerMessage = 'Debes aceptar los términos de servicio.';
      this.registerError   = true;
      return;
    }

    const body = {
      nombre:   this.regNombre,
      apellido: this.regApellido,
      email:    this.regEmail,
      empresa:  this.regEmpresa,
      tipo:     this.regTipo,
      password: this.regPassword
    };

    this.http.post<{ success: boolean; message: string }>(
      'api/auth/register', body
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.registerMessage = '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.';
          this.registerError   = false;
          this.clearRegisterForm();
          // Cambiar al tab de login tras 2s
          setTimeout(() => {
            this.activeTab       = 'login';
            this.registerMessage = '';
          }, 2000);
        } else {
          this.registerMessage = res.message || 'No se pudo crear la cuenta.';
          this.registerError   = true;
        }
      },
      error: () => {
        this.registerMessage = 'Error de conexión con el servidor.';
        this.registerError   = true;
      }
    });
  }

  // ── Limpia el formulario de registro ──────────────────
  private clearRegisterForm(): void {
    this.regNombre   = '';
    this.regApellido = '';
    this.regEmail    = '';
    this.regEmpresa  = '';
    this.regTipo     = '';
    this.regPassword = '';
    this.regTerms    = false;
  }

  // ── Expiración de token ────────────────────────────────
  checkTokenExpiration(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000;
      const now = Date.now();

      if (exp < now) {
        alert('Sesión expirada. Debes iniciar sesión nuevamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      this.router.navigate(['/']);
    }
  }

  // ── Modal de órdenes ───────────────────────────────────
  openOrdersModal(): void {
    this.isOrdersModalOpen = true;

    this.http.get<OrderData[]>('/custom-response')
      .subscribe({
        next: (res) => {
          this.orders = res.filter(order => order.status === 'APROBADO');
        },
        error: (err) => {
          console.error('Error al obtener órdenes:', err);
          this.orders = [];
        }
      });
  }

  closeOrdersModal(): void {
    this.isOrdersModalOpen = false;
  }
}

// ── Interfaz para tipar los datos del endpoint de órdenes ──
interface OrderData {
  id: number;
  status: string;
  approved_date: string | null;
  approved_by: string | null;
}