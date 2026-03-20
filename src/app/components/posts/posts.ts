import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/posts';
import { Comments } from '../comments/comments';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [FormsModule, CommonModule, Comments],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts implements OnInit {
  private postService = inject(PostService);
  posts = signal<any[]>([]);
  newPostText = '';
  newPostImage: File | null = null;
  newPostImagePreview: string | null = null;

  // Estado de edición
  editingPostId: number | null = null;
  editPostText = '';
  editPostImage: File | null = null;
  editPostImagePreview: string | null = null;

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts().subscribe({
      next: (data) => {
        const result = Array.isArray(data) ? data : (data.results ?? []);
        this.posts.set(result); // Angular actualiza el DOM automáticamente
        console.log('POSTS cargados:', this.posts());
      },
      error: (err) => {
        console.error('Error cargando los posts:', err);
      },
    });
  }

  toggleLike(post: any) {
    this.posts.update((lista) =>
      lista.map((p) =>
        p.id === post.id
          ? { ...p, likes: (p.likes || 0) + (p.hasLiked ? -1 : 1), hasLiked: !p.hasLiked }
          : p,
      ),
    );
  }

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
    this.editingPostId = post.id;
    this.editPostText = post.text;
    this.editPostImage = null;
    this.editPostImagePreview = post.image || null;
  }

  cancelEdit() {
    this.editingPostId = null;
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
    if (!this.editingPostId) return;

    const formData = new FormData();
    formData.append('text', this.editPostText);
    if (this.editPostImage) {
      formData.append('image', this.editPostImage);
    }

    this.postService.updatePost(this.editingPostId, formData).subscribe({
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

