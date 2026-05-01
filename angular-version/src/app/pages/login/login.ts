import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

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
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private router = inject(Router);

  isLoginMode = signal(true);
  showPassword = signal(false);
  showRePassword = signal(false);
  submitAttempted = signal(false);
  formMessage = signal('');
  formMessageType = signal<'error' | 'success'>('error');

  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    name: [''],
    phone: ['', [Validators.pattern(/^[6789]\d{8}$/)]],
    repassword: ['']
  });

  toggleMode() {
    this.isLoginMode.update(mode => !mode);
    this.authForm.reset();
    this.submitAttempted.set(false);
    this.clearFormMessage();
    this.updateValidatorsForMode();
  }

  onSubmit() {
    this.submitAttempted.set(true);
    this.clearFormMessage();
    this.authForm.markAllAsTouched();
    this.authForm.updateValueAndValidity();

    if (this.authForm.invalid) {
      return;
    }

    if (this.isLoginMode()) {
      this.iniciarSesion();
    } else {
      this.registrarse();
    }
  }

  shouldShowError(controlName: string): boolean {
    const control = this.authForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  getFieldError(controlName: string): string {
    const control = this.authForm.get(controlName);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors['email']) {
      return 'Introduce un correo electronico valido.';
    }

    if (control.errors['pattern']) {
      if (controlName === 'password') {
        return 'Minimo 8 caracteres, una mayuscula, un numero y un simbolo.';
      }

      if (controlName === 'phone') {
        return 'Introduce un telefono valido de 9 cifras.';
      }
    }

    if (control.errors['mismatch']) {
      return 'Las contrasenas no coinciden.';
    }

    if (control.errors['duplicate']) {
      return 'Este correo ya esta registrado.';
    }

    if (control.errors['invalidCredentials']) {
      return controlName === 'email'
        ? 'Revisa el correo introducido.'
        : 'Revisa la contrasena introducida.';
    }

    return 'Revisa este campo.';
  }

  private iniciarSesion() {
    const { email, password } = this.authForm.value;

    this.dataService.getUsers().pipe(take(1)).subscribe({
      next: (dbUsers = []) => {
        const usuarioEncontrado = dbUsers.find(u => u.email === email && u.password === password);

        if (usuarioEncontrado) {
          this.authService.login(usuarioEncontrado);

          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });
        } else {
          this.showFormError('Correo o contrasena incorrectos.');
          this.authForm.controls['email'].setErrors({ invalidCredentials: true });
          this.authForm.controls['password'].setErrors({ invalidCredentials: true });
        }
      },
      error: (err) => {
        console.error('Error al conectar con la coleccion users de Firestore:', err);
        this.showFormError('Hubo un problema al validar tus datos.');
      }
    });
  }

  private registrarse() {
    const { email, password, repassword, name, phone } = this.authForm.value;

    if (password !== repassword) {
      this.authForm.controls['repassword'].setErrors({ mismatch: true });
      return;
    }

    const newUser: User = {
      name: name,
      email: email,
      type: 'user',
      phone: phone,
      password: password
    };

    this.dataService.getUsers().pipe(take(1)).subscribe({
      next: (dbUsers = []) => {
        if (dbUsers.some(u => u.email === email)) {
          this.authForm.controls['email'].setErrors({ duplicate: true });
          return;
        }

        this.dataService.addUser(newUser)
          .then(() => {
            this.formMessageType.set('success');
            this.formMessage.set('Te has registrado correctamente. Ahora puedes iniciar sesion.');
            this.isLoginMode.set(true);
            this.authForm.reset();
            this.submitAttempted.set(false);
            this.updateValidatorsForMode();
          })
          .catch((err) => {
            console.error('Error al registrar usuario en Firestore:', err);
            this.showFormError('Hubo un problema al registrar tus datos.');
          });
      },
      error: (err) => {
        console.error('Error al comprobar usuarios en Firestore:', err);
        this.showFormError('Hubo un problema al comprobar tus datos.');
      }
    });
  }

  private updateValidatorsForMode(): void {
    const name = this.authForm.controls['name'];
    const phone = this.authForm.controls['phone'];
    const password = this.authForm.controls['password'];
    const repassword = this.authForm.controls['repassword'];

    if (this.isLoginMode()) {
      name.clearValidators();
      password.setValidators([Validators.required]);
      repassword.clearValidators();
    } else {
      name.setValidators([Validators.required]);
      password.setValidators([Validators.required, Validators.pattern(this.passwordPattern)]);
      repassword.setValidators([Validators.required]);
    }

    phone.setValidators([Validators.pattern(/^[6789]\d{8}$/)]);
    [name, phone, password, repassword].forEach((control: AbstractControl) => {
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private showFormError(message: string): void {
    this.formMessageType.set('error');
    this.formMessage.set(message);
  }

  private clearFormMessage(): void {
    this.formMessage.set('');
  }
}
