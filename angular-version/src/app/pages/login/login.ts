import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoginMode = signal(true);
  showPassword = signal(false);
  showRePassword = signal(false);
  submitAttempted = signal(false);
  formMessage = signal('');
  formMessageType = signal<'error' | 'success'>('error');
  isSubmitting = signal(false);
  isGoogleSubmitting = signal(false);
  isResetSubmitting = signal(false);

  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    name: [''],
    phone: ['', [Validators.pattern(/^[6789]\d{8}$/)]],
    repassword: ['']
  });

  constructor() {
    effect(() => {
      if (this.authService.authReady() && this.authService.currentUser()) {
        void this.navigateAfterSuccess();
      }
    });
  }

  toggleMode() {
    this.isLoginMode.update((mode) => !mode);
    this.authForm.reset({
      email: this.authForm.get('email')?.value ?? '',
      password: '',
      name: '',
      phone: '',
      repassword: '',
    });
    this.submitAttempted.set(false);
    this.clearFormMessage();
    this.updateValidatorsForMode();
  }

  async onSubmit() {
    this.submitAttempted.set(true);
    this.clearFormMessage();
    this.authForm.markAllAsTouched();
    this.authForm.updateValueAndValidity();

    if (this.authForm.invalid || this.isSubmitting() || this.isGoogleSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      if (this.isLoginMode()) {
        await this.iniciarSesion();
      } else {
        await this.registrarse();
      }
    } catch (error) {
      this.handleAuthError(error, this.isLoginMode() ? 'login' : 'register');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async loginWithGoogle() {
    if (this.isSubmitting() || this.isGoogleSubmitting()) {
      return;
    }

    this.submitAttempted.set(false);
    this.clearFormMessage();
    this.isGoogleSubmitting.set(true);

    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      this.handleAuthError(error, 'google');
    } finally {
      this.isGoogleSubmitting.set(false);
    }
  }

  async sendResetPassword() {
    const emailControl = this.authForm.controls['email'];
    emailControl.markAsTouched();
    emailControl.updateValueAndValidity();
    this.submitAttempted.set(true);
    this.clearFormMessage();

    if (emailControl.invalid || this.isResetSubmitting()) {
      return;
    }

    this.isResetSubmitting.set(true);

    try {
      const email = (emailControl.value ?? '').trim();
      await this.authService.sendPasswordReset(email);
      this.formMessageType.set('success');
      this.formMessage.set('Te hemos enviado un correo para restablecer la contrasena.');
    } catch (error) {
      this.handleAuthError(error, 'reset');
    } finally {
      this.isResetSubmitting.set(false);
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

    if (control.errors['banned']) {
      return 'Este usuario esta baneado.';
    }

    return 'Revisa este campo.';
  }

  private async iniciarSesion() {
    const { email, password } = this.authForm.getRawValue();
    await this.authService.loginWithEmailPassword((email ?? '').trim(), password ?? '');
  }

  private async registrarse() {
    const { email, password, repassword, name, phone } = this.authForm.getRawValue();

    if (password !== repassword) {
      this.authForm.controls['repassword'].setErrors({ mismatch: true });
      return;
    }

    await this.authService.registerWithEmailPassword(
      (name ?? '').trim(),
      (email ?? '').trim(),
      (phone ?? '').trim(),
      password ?? '',
    );

    this.formMessageType.set('success');
    this.formMessage.set('Registro completado correctamente.');
    this.isLoginMode.set(true);
    this.authForm.reset({
      email: (email ?? '').trim(),
      password: '',
      name: '',
      phone: '',
      repassword: '',
    });
    this.submitAttempted.set(false);
    this.updateValidatorsForMode();
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

  private async navigateAfterSuccess(): Promise<void> {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/pet-schedule';
    await this.router.navigateByUrl(redirectTo);
  }

  private handleAuthError(error: unknown, context: 'login' | 'register' | 'google' | 'reset'): void {
    const code = this.extractErrorCode(error);

    if (code === 'auth/email-already-in-use') {
      this.authForm.controls['email'].setErrors({ duplicate: true });
      this.showFormError('Este correo ya esta registrado.');
      return;
    }

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      this.authForm.controls['email'].setErrors({ invalidCredentials: true });
      this.authForm.controls['password'].setErrors({ invalidCredentials: true });
      this.showFormError('Correo o contrasena incorrectos.');
      return;
    }

    if (code === 'auth/user-banned') {
      this.authForm.controls['email'].setErrors({ banned: true });
      this.showFormError('Tu usuario ha sido baneado y no puede acceder a la app.');
      return;
    }

    if (code === 'auth/popup-closed-by-user') {
      this.showFormError('Has cerrado la ventana de Google antes de completar el acceso.');
      return;
    }

    if (code === 'auth/too-many-requests') {
      this.showFormError('Hay demasiados intentos. Espera unos minutos y vuelve a probar.');
      return;
    }

    if (context === 'reset') {
      this.showFormError('No se pudo enviar el correo de recuperacion.');
      return;
    }

    if (context === 'google') {
      this.showFormError('No se pudo iniciar sesion con Google.');
      return;
    }

    if (context === 'register') {
      this.showFormError('Hubo un problema al registrar tus datos.');
      return;
    }

    this.showFormError('Hubo un problema al iniciar sesion.');
  }

  private extractErrorCode(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
      return error.code;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'unknown';
  }

  private showFormError(message: string): void {
    this.formMessageType.set('error');
    this.formMessage.set(message);
  }

  private clearFormMessage(): void {
    this.formMessage.set('');
  }
}
