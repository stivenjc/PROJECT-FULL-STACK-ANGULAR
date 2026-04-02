import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../services/usuario';
import { PostService } from '../../services/posts';
import { Comments } from '../comments/comments';
import { Likes } from '../likes/likes';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Comments, Likes],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private usuarioService = inject(Usuario);
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);

  user = signal<any>(null);
  myPosts = signal<any[]>([]);
  loading = signal(true);
  isMyProfile = signal(true);
  fallowersCount = signal(0);
  fallowingsCount = signal(0);

  friendshipStatus = signal<'none' | 'fallowing' | 'pending_received' | 'pending_sent' | 'is_me'>(
    'none',
  );
  requestId = signal<number | null>(null);

  // Modal and Edit state
  selectedPost = signal<any>(null);
  isEditing = signal(false);
  editPostText = '';

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const userId = params['id'];
      if (userId) {
        this.isMyProfile.set(userId == localStorage.getItem('user_id'));
        this.loadOtherUserData(Number(userId));
        this.loadPosts(userId);
        this.checkFriendship(Number(userId));
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
      this.usuarioService.getUserById(Number(userId)).subscribe((userData) => {
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
      error: (err) => console.error('Error al cargar usuario:', err),
    });
  }

  checkFriendship(userId: number) {
    this.usuarioService.fallowUser(userId).subscribe({
      next: (res) => {
        this.fallowersCount.set(res.fallowers);
        this.fallowingsCount.set(res.fallowing);
      },
      error: (err) => console.error('Error al traer lo fallow:', err),
    });

    if (this.isMyProfile()) {
      this.friendshipStatus.set('is_me');
      return;
    }
    this.usuarioService.checkinIsFriend(userId).subscribe({
      next: (res) => {
        this.friendshipStatus.set(res.status);
        this.requestId.set(res.id || null);
      },
      error: (err) => console.error('Error al verificar amistad:', err),
    });
  }

  sendRequest(userId: number, is_private: boolean = false) {
    console.log('Sending request:', is_private);
    if (is_private) {
      console.log(is_private);
      this.usuarioService.sendFriendRequest(userId).subscribe({
        next: () => {
          this.checkFriendship(userId);
        },
        error: (err) => console.error('Error al enviar solicitud:', err),
      });
    } else {
      this.usuarioService.sendFriendRequest(userId, true).subscribe({
        next: () => {
          console.log('Sending request:', is_private, 'edsde el donde supuestamente esta libre');
          this.checkFriendship(userId);
        },
        error: (err) => console.error('Error al enviar solicitud:', err),
      });
    }
  }

  acceptRequest() {
    if (!this.requestId()) return;
    this.usuarioService.acceptFriendRequest(this.requestId()!).subscribe({
      next: () => {
        this.checkFriendship(this.user().id);
      },
      error: (err) => console.error('Error al aceptar solicitud:', err),
    });
  }

  cancelRequest() {
    if (!this.requestId()) return;
    if (confirm('¿Estás seguro de que deseas cancelar la solicitud?')) {
      this.usuarioService.deleteFriendship(this.requestId()!).subscribe({
        next: () => {
          this.checkFriendship(this.user().id);
        },
        error: (err) => console.error('Error al cancelar solicitud:', err),
      });
    }
  }

  removeFriend() {
    if (!this.requestId()) return;
    if (confirm('¿Estás seguro de que deseas dejar de seguir a esta persona?')) {
      this.usuarioService.deleteFriendship(this.requestId()!).subscribe({
        next: () => {
          this.checkFriendship(this.user().id);
        },
        error: (err) => console.error('Error al dejar de seguir:', err),
      });
    }
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
      error: (err) => console.error('Error al subir foto:', err),
    });
  }

  loadPosts(userId: string | null) {
    if (!userId) return;
    this.loading.set(true);
    this.postService.getPosts().subscribe((data) => {
      const list = Array.isArray(data) ? data : data.results;
      this.myPosts.set(list.filter((p: any) => p.created_by == userId));
      this.loading.set(false);
    });
  }

  togglePrivacy() {
    if (!this.isMyProfile()) return;
    const userId = Number(localStorage.getItem('user_id'));
    const newStatus = !this.user().private;

    this.usuarioService.updateUser(userId, { private: newStatus }).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.usuarioService.currentUser.set(updatedUser);
      },
      error: (err) => console.error('Error al cambiar privacidad:', err),
    });
  }

  getPhotoUrl(photo: string | null): string {
    return this.usuarioService.getPhotoUrl(photo);
  }

  // Modal Methods
  openPost(post: any) {
    this.selectedPost.set(post);
    this.isEditing.set(false);
    this.editPostText = post.text;
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  closePost() {
    this.selectedPost.set(null);
    this.isEditing.set(false);
    document.body.style.overflow = 'auto'; // Restore scrolling
  }

  deletePost(postId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.myPosts.update((posts) => posts.filter((p) => p.id !== postId));
          this.closePost();
        },
        error: (err) => console.error('Error al eliminar post:', err),
      });
    }
  }

  startEdit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editPostText = this.selectedPost().text;
  }

  saveEdit() {
    const postId = this.selectedPost().id;
    this.postService.updatePost(postId, { text: this.editPostText }).subscribe({
      next: (updatedPost) => {
        // Update in myPosts list
        this.myPosts.update((posts) =>
          posts.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p)),
        );
        // Update selected post
        this.selectedPost.set({ ...this.selectedPost(), ...updatedPost });
        this.isEditing.set(false);
      },
      error: (err) => console.error('Error al actualizar post:', err),
    });
  }
}
