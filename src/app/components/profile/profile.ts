import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../services/usuario';
import { PostService } from '../../services/posts';
import { Comments } from '../comments/comments';
import { Likes } from '../likes/likes';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Comments, Likes],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  public usuarioService = inject(Usuario);
  private postService = inject(PostService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  user = signal<any>(null);
  myPosts = signal<any[]>([]);
  loading = signal(true);
  isMyProfile = signal(true);
  followersCount = signal(0);
  followingsCount = signal(0);

  private currentUserId = Number(localStorage.getItem('user_id'));

  // 🧠 Status calculado automáticamente desde el Estado Global del Servicio
  friendshipStatus = computed(() => {
    const userData = this.user();
    if (!userData) return 'none';
    const userId = userData.id;

    if (userId === this.currentUserId) return 'is_me';

    // Verificar si son amigos (siguiendo)
    const isFriend = this.usuarioService.friendsList().some(f =>
      f.receiver === userId && f.transmitter === this.currentUserId
    );
    if (isFriend) return 'following';

    // Verificar si hay solicitud recibida
    const hasReceived = this.usuarioService.pendingReceived().some(f => f.transmitter === userId);
    if (hasReceived) return 'pending_received';

    // Verificar si hay solicitud enviada
    const hasSent = this.usuarioService.pendingSent().some(f => f.receiver === userId);
    if (hasSent) return 'pending_sent';

    return 'none';
  });

  // Modal and Edit state
  selectedPost = signal<any>(null);
  isEditing = signal(false);
  editPostText = '';

  ngOnInit() {
    // Sincronizamos el estado social al entrar
    this.usuarioService.syncSocialState();

    this.route.params.subscribe((params) => {
      const userId = params['id'];
      if (userId) {
        this.isMyProfile.set(userId == localStorage.getItem('user_id'));
        this.loadOtherUserData(Number(userId));
        this.loadPosts(userId);
        this.loadFollowers(Number(userId));
      } else {
        this.loadFollowers(Number(localStorage.getItem('user_id')));
        this.isMyProfile.set(true);
        this.loadCurrentUserData();
        this.loadPosts(localStorage.getItem('user_id'));
      }
    })
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

  loadFollowers(userId: number) {
    this.usuarioService.followUser(userId).subscribe({
      next: (res: any) => {
        this.followersCount.set(res.followers || res.fallowers || 0);
        this.followingsCount.set(res.following || res.fallowing || 0);
      },
      error: (err: any) => console.error('Error al traer lo follow:', err),
    });
  }

  sendRequest(userId: number, is_private: boolean = false) {
    this.usuarioService.sendFriendRequest(userId, !is_private).subscribe({
      next: () => {
        if (is_private) {
          this.toastService.info('Solicitud de seguimiento enviada');
        } else {
          this.toastService.success(`Ahora sigues a ${this.user()?.username}`);
        }
      },
      error: () => this.toastService.error('Errror al intentar procesar la solicitud')
    });
  }

  acceptRequest() {
    const friendship = this.usuarioService.getFriendship(this.user().id);
    if (friendship) {
      this.usuarioService.acceptFriendRequest(friendship.id).subscribe({
        next: () => this.toastService.success('Solicitud confirmada'),
        error: () => this.toastService.error('Error al aceptar la solicitud')
      });
    }
  }

  cancelOrRemove() {
    const friendship = this.usuarioService.getFriendship(this.user().id);
    if (friendship && confirm(`¿Estás seguro de que deseas cancelar la relación con ${this.user()?.username}?`)) {
      this.usuarioService.deleteFriendship(friendship.id).subscribe({
        next: () => this.toastService.info('Relación finalizada'),
        error: () => this.toastService.error('Error al procesar la cancelación')
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
