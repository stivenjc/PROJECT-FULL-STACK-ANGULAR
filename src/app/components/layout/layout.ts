import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Usuario } from '../../services/usuario';
import { Comments } from "../comments/comments";
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  private router = inject(Router);
  public usuarioService = inject(Usuario);
  public user_id = localStorage.getItem("user_id");
  ngOnInit() {
    this.usuarioService.getUserById(Number(this.user_id)).subscribe(user => {
      this.usuarioService.currentUser.set(user);
    })
  }

  logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.usuarioService.logoutBackend().subscribe({
        next: () => {
          localStorage.clear();
          this.usuarioService.currentUser.set(null);
          this.router.navigate(['/login']);
        },
        error: (err) => console.error('Error al cerrar sesión:', err)
      });
    }
  }
}