import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../services/usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  private usuarioService = inject(Usuario);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const datosDelFormulario = this.registerForm.value;

      this.usuarioService.registrarUsuario(datosDelFormulario).subscribe({
        next: (respuestaApi) => {
          alert('¡Cuenta creada correctamente!');
          this.router.navigate(['/login']);
        },
        error: (errorApi) => {
          console.error('Hubo un error al registrarse:', errorApi);
          alert('Error al registrar usuario. Revisa la consola para más detalles.');
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
