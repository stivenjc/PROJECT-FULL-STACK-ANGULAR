import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/posts';
import { Comments } from '../comments/comments';
import { Likes } from '../likes/likes';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [FormsModule, CommonModule, Comments, Likes],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts implements OnInit, OnDestroy {
  posts = signal<any[]>([]);
  private postService = inject(PostService);
  private pollingInterval: any;

  // Estados para creación de post
  newPostText = '';
  newPostImage: File | null = null;
  newPostImagePreview: string | null = null;

  // Estados para edición
  editingPostId = signal<number | null>(null);
  editPostText = '';
  editPostImage: File | null = null;
  editPostImagePreview: string | null = null;

  ngOnInit() {
    this.loadPosts(); // Carga inicial
    // Iniciamos el polling cada 30 segundos
    this.pollingInterval = setInterval(() => {
      this.loadPosts();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadPosts() {
    // Solo vemos post de amigos como siguiente paso solicitado
    this.postService.getPosts(true).subscribe({
      next: (data) => {
        const result = Array.isArray(data) ? data : (data.results ?? []);

        // Sincronizamos los datos nuevos manteniendo el estado de 'showComments'
        this.posts.update(currentPosts => {
          return result.map((newP: any) => {
            const oldP = currentPosts.find((p: any) => p.id === newP.id);
            return {
              ...newP,
              showComments: oldP ? oldP.showComments : false
            };
          });
        });

        console.log('Feed actualizado (Polling)');
      },
      error: (err) => {
        console.error('Error cargando los posts:', err);
      },
    });
  }

  // Métodos del Post (el de Like se movió al componente Likes)

  toggleComments(post: any) {
    this.posts.update((lista) =>
      lista.map((p) => (p.id === post.id ? { ...p, showComments: !p.showComments } : p)),
    );
  }

  // -------- Formulario nuevo post --------

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.newPostImage = input.files[0];
      // Genera preview local sin subir nada aún
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newPostImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.newPostImage);
    }
  }

  removeImage() {
    this.newPostImage = null;
    this.newPostImagePreview = null;
  }

  createPost() {
    if (!this.newPostText.trim() && !this.newPostImage) return;

    const formData = new FormData();
    formData.append('text', this.newPostText);
    if (this.newPostImage) {
      formData.append('image', this.newPostImage);
    }

    console.log('Creando post:', this.newPostText, this.newPostImage?.name);
    this.postService.createPost(formData).subscribe({
      next: (data) => {
        console.log('Post creado exitosamente:', data);
        this.newPostText = '';
        this.removeImage();
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error al crear el post:', err);
        alert('No se pudo crear el post. Intenta de nuevo.');
      },
    });
  }

  // -------- Edición de post --------

  startEdit(post: any) {
    this.editingPostId.set(post.id);
    this.editPostText = post.text;
    this.editPostImage = null;
    this.editPostImagePreview = post.image || null;
  }

  cancelEdit() {
    this.editingPostId.set(null);
    this.editPostText = '';
    this.editPostImage = null;
    this.editPostImagePreview = null;
  }

  onEditImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.editPostImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editPostImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.editPostImage);
    }
  }

  saveEdit() {
    const currentId = this.editingPostId();
    if (!currentId) return;

    const formData = new FormData();
    formData.append('text', this.editPostText);
    if (this.editPostImage) {
      formData.append('image', this.editPostImage);
    }

    this.postService.updatePost(currentId, formData).subscribe({
      next: (data) => {
        console.log('Post actualizado:', data);
        alert('Post actualizado exitosamente');
        this.cancelEdit();
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error al actualizar el post:', err);
        alert('No se pudo actualizar el post.');
      },
    });
  }

  deletePost(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          alert('Post eliminado');
          this.loadPosts();
        },
        error: (err) => {
          console.error('Error al eliminar el post:', err);
          alert('No se pudo eliminar el post.');
        },
      });
    }
  }
}

