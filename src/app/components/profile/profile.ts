import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../services/usuario';
import { PostService } from '../../services/posts';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private usuarioService = inject(Usuario);
  private postService = inject(PostService);

  // Datos del usuario (AHORA USAMOS LA SEÑAL GLOBAL)
  user = this.usuarioService.currentUser;
  myPosts = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadUserData();
    this.loadMyPosts();
  }

  loadUserData() {
    const userId = localStorage.getItem('user_id');
    // Solo cargamos si la señal global está vacía
    if (userId && !this.user()) {
      this.usuarioService.getUsers().subscribe(users => {
        const list = Array.isArray(users) ? users : users.results;
        const currentUser = list.find((u: any) => u.id == userId);
        this.usuarioService.currentUser.set(currentUser);
      });
    }
  }

  // --- Lógica de Edición de Foto ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File) {
    const userId = Number(localStorage.getItem('user_id'));
    const formData = new FormData();
    formData.append('foto', file); // 'foto' es el campo en Django

    this.usuarioService.updateUser(userId, formData).subscribe({
      next: (updatedUser) => {
        // ACTUALIZACIÓN GLOBAL: Todo el sitio web cambia de foto al instante
        this.usuarioService.currentUser.set(updatedUser);
      },
      error: (err) => console.error('Error al subir foto:', err)
    });
  }

  loadMyPosts() {
    const userId = localStorage.getItem('user_id');
    // Usamos el filtro de created_by que ya tiene tu backend
    this.postService.getPosts().subscribe(data => {
      const list = Array.isArray(data) ? data : data.results;
      this.myPosts.set(list.filter((p: any) => p.created_by == userId));
      this.loading.set(false);
    });
  }

  // Ahora usamos el del servicio
  getPhotoUrl(photo: string | null): string {
    return this.usuarioService.getPhotoUrl(photo);
  }
}
