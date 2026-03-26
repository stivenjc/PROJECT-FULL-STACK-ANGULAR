import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../services/usuario';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  private usuarioService = inject(Usuario);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const datosDelFormulario = this.loginForm.value;

      this.usuarioService.loginUser(datosDelFormulario).subscribe({
        next: (response) => {
          alert('Login correcto!');
          localStorage.setItem('token', response.token);
          localStorage.setItem('user_id', response.user.id);
          localStorage.setItem('user_username', response.user.username);
          localStorage.setItem('user_email', response.user.email);
          this.router.navigate(['/posts']);
        },
        error: (err) => {
          // err.error contiene la respuesta del backend (ej: en Django DRF suele venir como { detail: "..." } o en otras APIs { message: "..." })
          this.errorMessage = err.error?.detail || err.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          console.error('- Error de login detectado -', err);
        }
      });
    } else {
      alert('El formulario tiene errores o le faltan campos.');
      this.loginForm.markAllAsTouched();
    }
  }
}
