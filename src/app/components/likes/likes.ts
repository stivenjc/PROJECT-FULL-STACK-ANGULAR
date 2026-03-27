import { Component, Input, inject, signal, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/posts';

@Component({
  selector: 'app-likes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './likes.html',
  styleUrl: './likes.css',
})
export class Likes implements OnChanges {
  @Input({ required: true }) post: any;
  @Output() commentToggled = new EventEmitter<void>();
  private postService = inject(PostService);

  likesCount = signal<number>(0);
  isLiked = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['post'] && this.post) {
      this.likesCount.set(this.post.likes_count || 0);
      this.isLiked.set(this.post.has_liked || false);
    }
  }

  toggleLike() {
    const previousIsLiked = this.isLiked();
    const previousCount = this.likesCount();

    if (previousIsLiked) {
      this.isLiked.set(false);
      this.likesCount.set(previousCount - 1);

      this.postService.disLikePost(this.post.id).subscribe({
        next: () => this.sincronizarObjetoPadre(),
        error: (err) => {
          this.revertirCambios(previousIsLiked, previousCount);
          console.error('Error al quitar like:', err);
        }
      });

    } else {
      this.isLiked.set(true);
      this.likesCount.set(previousCount + 1);

      this.postService.likePost({ post: this.post.id }).subscribe({
        next: () => this.sincronizarObjetoPadre(),
        error: (err) => {
          this.revertirCambios(previousIsLiked, previousCount);
          console.error('Error al dar like:', err);
        }
      });
    }
  }

  private sincronizarObjetoPadre() {
    if (this.post) {
      this.post.likes_count = this.likesCount();
      this.post.has_liked = this.isLiked();
    }
  }

  private revertirCambios(liked: boolean, count: number) {
    this.isLiked.set(liked);
    this.likesCount.set(count);
    alert('No se pudo procesar el Like. Por favor, intenta de nuevo.');
  }
}
