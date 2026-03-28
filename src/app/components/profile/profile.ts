import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  user = signal<any>(null);
  myPosts = signal<any[]>([]);
  loading = signal(true);
  isMyProfile = signal(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.isMyProfile.set(userId == localStorage.getItem('user_id'));
        this.loadOtherUserData(Number(userId));
        this.loadPosts(userId);
      } else {
        this.isMyProfile.set(true);
        this.loadCurrentUserData();
        this.loadPosts(localStorage.getItem('user_id'));
      }
    });
  }

  loadCurrentUserData() {
    const userId = localStorage.getItem('user_id');
    if (this.usuarioService.currentUser()) {
      this.user.set(this.usuarioService.currentUser());
    } else if (userId) {
      this.usuarioService.getUserById(Number(userId)).subscribe(userData => {
        this.user.set(userData);
        this.usuarioService.currentUser.set(userData);
      });
    }
  }

  loadOtherUserData(userId: number) {
    this.loading.set(true);
    this.usuarioService.getUserById(userId).subscribe({
      next: (userData) => {
        this.user.set(userData);
      },
      error: (err) => console.error('Error al cargar usuario:', err)
    });
  }

  onFileSelected(event: any) {
    if (!this.isMyProfile()) return;
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
        this.user.set(updatedUser);
        this.usuarioService.currentUser.set(updatedUser);
      },
      error: (err) => console.error('Error al subir foto:', err)
    });
  }

  loadPosts(userId: string | null) {
    if (!userId) return;
    this.loading.set(true);
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
