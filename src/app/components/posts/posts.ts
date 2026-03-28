import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/posts';
import { Usuario } from '../../services/usuario';
import { Comments } from '../comments/comments';
import { Likes } from '../likes/likes';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [FormsModule, CommonModule, Comments, Likes, RouterLink],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts implements OnInit, OnDestroy {
  posts = signal<any[]>([]);
  private postService = inject(PostService);
  public usuarioService = inject(Usuario);
  private pollingInterval: any;

  newPostText = '';
  newPostImage: File | null = null;
  newPostImagePreview: string | null = null;

  editingPostId = signal<number | null>(null);
  editPostText = '';
  editPostImage: File | null = null;
  editPostImagePreview: string | null = null;

  ngOnInit() {
    this.loadPosts();
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
    this.postService.getPosts(true).subscribe({
      next: (data) => {
        const result = Array.isArray(data) ? data : (data.results ?? []);

        this.posts.update(currentPosts => {
          return result.map((newP: any) => {
            const oldP = currentPosts.find((p: any) => p.id === newP.id);
            return {
              ...newP,
              showComments: oldP ? oldP.showComments : false
            };
          });
        });
      },
      error: (err) => {
        console.error('Error cargando los posts:', err);
      },
    });
  }

  toggleComments(post: any) {
    this.posts.update((lista) =>
      lista.map((p) => (p.id === post.id ? { ...p, showComments: !p.showComments } : p)),
    );
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.newPostImage = input.files[0];
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

    this.postService.createPost(formData).subscribe({
      next: (data) => {
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

