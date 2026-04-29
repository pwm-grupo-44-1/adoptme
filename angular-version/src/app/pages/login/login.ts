import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';
import { User } from '../../models/user';

import { collection, getDocs, addDoc } from 'firebase/firestore';
import { dbFirebase } from '../../firebase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoginMode = signal(true);
  showPassword = signal(false);
  showRePassword = signal(false);

  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    name: [''],
    phone: [''],
    repassword: ['']
  });

  toggleMode() {
    this.isLoginMode.update(mode => !mode);
    this.authForm.reset();
  }

  async onSubmit() {
    if (this.authForm.invalid) {
      alert('Formulario incorrecto');
      return;
    }

    if (this.isLoginMode()) {
      await this.iniciarSesion();
    } else {
      await this.registrarse();
    }
  }

  // 🔐 LOGIN
  private async iniciarSesion() {
    const email = this.authForm.value.email?.trim().toLowerCase();
    const password = this.authForm.value.password?.trim();

    try {
      const snapshot = await getDocs(collection(dbFirebase, 'users'));

      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<User, 'id'>)
      })) as User[];

      console.log("Usuarios Firebase:", users);

      const user = users.find(u =>
        u.email?.toLowerCase() === email &&
        u.password === password
      );

      console.log("Usuario encontrado:", user);

      if (user) {
        this.authService.login(user);
        this.router.navigate(['/']);
      } else {
        alert('Correo o contraseña incorrectos');
      }

    } catch (err) {
      console.error(err);
      alert('Error leyendo Firebase');
    }
  }

  // 📝 REGISTRO
  private async registrarse() {
    const email = this.authForm.value.email?.trim().toLowerCase();
    const password = this.authForm.value.password?.trim();
    const repassword = this.authForm.value.repassword?.trim();
    const name = this.authForm.value.name?.trim();
    const phone = this.authForm.value.phone?.trim();

    if (password !== repassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const snapshot = await getDocs(collection(dbFirebase, 'users'));

      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<User, 'id'>)
      })) as User[];

      const exists = users.some(u =>
        u.email?.toLowerCase() === email
      );

      if (exists) {
        alert('El usuario ya existe');
        return;
      }

      const newUser: User = {
        name,
        email,
        password,
        phone,
        type: 'user'
      };

      const docRef = await addDoc(collection(dbFirebase, 'users'), newUser);

      const createdUser: User = {
        ...newUser
      };

      this.authService.login(createdUser);
      this.router.navigate(['/']);

    } catch (err) {
      console.error(err);
      alert('Error registrando usuario');
    }
  }
}

export default LoginComponent
