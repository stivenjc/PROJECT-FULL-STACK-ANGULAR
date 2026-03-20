import { Component, Input, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/posts';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments implements OnChanges {
  @Input({ required: true }) post: any;
  private postService = inject(PostService);

  // 1. Definimos un Signal para los comentarios.
  // Esto permite que Angular sepa exactamente cuándo cambia la lista.
  comments = signal<any[]>([]);
  newCommentText = '';

  // Estados para la edición
  editingCommentId = signal<number | null>(null);
  editCommentText = '';

  // Sincronizamos el signal cuando cambie el post (el Input)
  ngOnChanges(changes: SimpleChanges) {
    if (changes['post'] && this.post) {
      this.comments.set(this.post.comments || []);
    }
  }

  submitComment(postId: number) {
    if (!this.newCommentText.trim()) return;

    const commentData = {
      title: this.newCommentText,
      post: postId,
    };

    this.postService.commentPost(commentData).subscribe({
      next: (newComment) => {
        // Actualizamos el Signal (esto dispara el cambio en el DOM de una)
        this.comments.update(lista => [...lista, newComment]);

        // También mantenemos el objeto original sincronizado
        setTimeout(() => {
          if (this.post.comments) {
            this.post.comments.push(newComment);
          }
        });

        this.newCommentText = '';
      },
      error: (err) => {
        console.error('Error al comentar:', err);
        alert('No se pudo publicar el comentario.');
      },
    });
  }

  // Lógica para Editar Comentarios
  startEditComment(comment: any) {
    this.editingCommentId.set(comment.id);
    this.editCommentText = comment.title;
  }

  cancelEditComment() {
    this.editingCommentId.set(null);
    this.editCommentText = '';
  }

  saveEditComment(comment: any) {
    if (!this.editCommentText.trim()) return;

    const data = { title: this.editCommentText };
    this.postService.updateComment(comment.id, data).subscribe({
      next: (updatedComment) => {
        // 1. Actualizamos el Signal (DOM local)
        this.comments.update(lista =>
          lista.map(c => c.id === comment.id ? { ...c, title: updatedComment.title } : c)
        );

        // 2. Sincronizamos con el objeto post original del padre
        setTimeout(() => {
          if (this.post.comments) {
            const index = this.post.comments.findIndex((c: any) => c.id === comment.id);
            if (index !== -1) {
              this.post.comments[index].title = updatedComment.title;
            }
          }
        });

        this.cancelEditComment();
      },
      error: (err) => {
        console.error('Error al editar comentario:', err);
        alert('No se pudo editar el comentario.');
      }
    });
  }

  // Lógica para Eliminar Comentarios
  deleteComment(commentId: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        // 1. Eliminamos del signal (DOM local del hijo)
        this.comments.update(lista => lista.filter(c => c.id !== commentId));

        // 2. Sincronizamos con el objeto original del padre (con setTimeout para evitar el error NG0100)
        setTimeout(() => {
          if (this.post.comments) {
            this.post.comments = this.post.comments.filter((c: any) => c.id !== commentId);
          }
        });
      },
      error: (err) => {
        console.error('Error al eliminar comentario:', err);
        alert('No se pudo eliminar el comentario.');
      }
    });
  }
}
