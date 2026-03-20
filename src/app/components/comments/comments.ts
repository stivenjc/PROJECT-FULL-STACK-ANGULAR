import { Component, Input, inject } from '@angular/core';
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
export class Comments {
  @Input({ required: true }) post: any;
  private postService = inject(PostService);

  newCommentText = '';

  submitComment(postId: number) {
    console.log('POST ID:', postId);
    if (!this.newCommentText.trim()) return;
    console.log('POST ID:', postId);

    const commentData = {
      title: this.newCommentText,
      post: postId
    };

    this.postService.commentPost(commentData).subscribe({
      next: (newComment) => {
        console.log('COMENTARIO NUEVO:', newComment);
        if (!this.post.comments) {
          this.post.comments = [];
        }
        this.post.comments = [...this.post.comments, newComment];
        this.newCommentText = '';
      },
      error: (err) => {
        console.error('Error al comentar:', err);
        alert('No se pudo publicar el comentario.');
      },
    });
  }
}
