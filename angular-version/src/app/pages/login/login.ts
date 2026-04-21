import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

// Ajusta estas rutas a tu estructura de carpetas real si fuera necesario
import { AuthService } from '../../services/auth';
import { DataService } from '../../services/data';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // Inyección de dependencias (Estándar Angular moderno)
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private router = inject(Router);

  // Signals para manejar el estado de la vista instantáneamente
  isLoginMode = signal(true);
  showPassword = signal(false);
  showRePassword = signal(false);

  // Formulario Reactivo
  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)]],
    name: [''],
    phone: ['', [Validators.pattern(/^[6789]\d{8}$/)]],
    repassword: ['']
  });

  toggleMode() {
    this.isLoginMode.update(mode => !mode);
    this.authForm.reset();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      alert('Por favor, revisa los errores en el formulario. Recuerda que la contraseña requiere 8 caracteres, mayúscula, número y símbolo.');
      return;
    }

    if (this.isLoginMode()) {
      this.iniciarSesion();
    } else {
      this.registrarse();
    }
  }

  private iniciarSesion() {
    const { email, password } = this.authForm.value;

    // 1. Pedimos los usuarios de la base de datos (db.json) a través de tu DataService
    this.dataService.getUsers().subscribe({
      next: (dbUsers) => {
        // 2. Rescatamos los usuarios recién registrados (que viven en LocalStorage)
        const localUsers: User[] = JSON.parse(localStorage.getItem('adoptme_new_users') || '[]');

        // 3. Juntamos ambas listas
        const allUsers = [...dbUsers, ...localUsers];

        // 4. COMPROBACIÓN REAL
        const usuarioEncontrado = allUsers.find(u => u.email === email && u.password === password);

        if (usuarioEncontrado) {
          // Logueamos al usuario usando tu AuthService (que internamente actualiza el signal currentUser)
          this.authService.login(usuarioEncontrado);

          // Navegamos a la home
          this.router.navigate(['/home']).then(() => {
            // Nota: Si el Header ya usa authService.currentUser(), no haría falta el reload,
            // pero lo mantenemos si tienes partes de la web que aún dependen de leer el localStorage al cargar.
            window.location.reload();
          });
        } else {
          alert('Correo o contraseña incorrectos.');
        }
      },
      error: (err) => {
        console.error('Error al conectar con la base de datos de usuarios:', err);
        alert('Hubo un problema al validar tus datos.');
      }
    });
  }

  private registrarse() {
    const { email, password, repassword, name, phone } = this.authForm.value;

    if (password !== repassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Leemos los registros previos del localStorage
    const localUsers: User[] = JSON.parse(localStorage.getItem('adoptme_new_users') || '[]');

    // Verificamos que el email no esté ya registrado en localStorage
    if (localUsers.some(u => u.email === email)) {
      alert('Este correo ya está registrado.');
      return;
    }

    // Creamos el nuevo usuario respetando ESTRICTAMENTE tu interfaz User de user.ts
    const newUser: User = {
      name: name,
      email: email,
      type: 'user', // Tu interfaz User dice: type: 'admin' | 'user'
      phone: phone, // phone es opcional según tu interfaz
      password: password
    };

    localUsers.push(newUser);
    localStorage.setItem('adoptme_new_users', JSON.stringify(localUsers));

    alert('¡Te has registrado correctamente! Ahora puedes iniciar sesión.');

    // Devolvemos el formulario a la vista de login y lo limpiamos
    this.isLoginMode.set(true);
    this.authForm.reset();
  }
}
