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

  user = this.usuarioService.currentUser;
  myPosts = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadUserData();
    this.loadMyPosts();
  }

  loadUserData() {
    const userId = localStorage.getItem('user_id');
    if (userId && !this.user()) {
      this.usuarioService.getUsers().subscribe(users => {
        const list = Array.isArray(users) ? users : users.results;
        const currentUser = list.find((u: any) => u.id == userId);
        this.usuarioService.currentUser.set(currentUser);
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File) {
    const userId = Number(localStorage.getItem('user_id'));
    const formData = new FormData();
    formData.append('foto', file);

    this.usuarioService.updateUser(userId, formData).subscribe({
      next: (updatedUser) => {
        this.usuarioService.currentUser.set(updatedUser);
      },
      error: (err) => console.error('Error al subir foto:', err)
    });
  }

  loadMyPosts() {
    const userId = localStorage.getItem('user_id');
    this.postService.getPosts().subscribe(data => {
      const list = Array.isArray(data) ? data : data.results;
      this.myPosts.set(list.filter((p: any) => p.created_by == userId));
      this.loading.set(false);
    });
  }

  getPhotoUrl(photo: string | null): string {
    return this.usuarioService.getPhotoUrl(photo);
  }
}
