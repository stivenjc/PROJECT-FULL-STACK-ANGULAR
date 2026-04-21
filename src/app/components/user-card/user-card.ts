import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../services/usuario';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css'
})
export class UserCardComponent {
  @Input() user: any;
  //@Input() status: string = 'none'; // Ya no se recibe del padre

  @Output() addToRecent = new EventEmitter<any>();
  @Output() delete = new EventEmitter<number>();

  @Input() showDelete = false;

  usuarioService = inject(Usuario);
  toastService = inject(ToastService);
  private currentUserId = Number(localStorage.getItem('user_id'));

  // 🧠 Status calculado automáticamente desde el Estado Global
  status = computed(() => {
    if (!this.user) return 'none';
    const userId = this.user.id;

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

  handleFollow(event: Event) {
    event.stopPropagation();
    const isPrivate = this.user.private;
    this.usuarioService.sendFriendRequest(this.user.id, !isPrivate).subscribe({
      next: () => {
        if (isPrivate) {
          this.toastService.info('Solicitud de seguimiento enviada');
        } else {
          this.toastService.success(`Ahora sigues a ${this.user.username}`);
        }
      },
      error: () => this.toastService.error('No se pudo enviar la solicitud')
    });
  }

  handleUnfollow(event: Event) {
    event.stopPropagation();
    const userId = this.user.id;
    const friendship =
      this.usuarioService.friendsList().find(f => (f.receiver === userId || f.transmitter === userId)) ||
      this.usuarioService.pendingSent().find(f => f.receiver === userId) ||
      this.usuarioService.pendingReceived().find(f => f.transmitter === userId);

    if (friendship && confirm('¿Estás seguro de que deseas dejar de seguir a este usuario?')) {
      this.usuarioService.deleteFriendship(friendship.id).subscribe({
        next: () => this.toastService.success('Has dejado de seguir al usuario'),
        error: () => this.toastService.error('Error al procesar la solicitud')
      });
    }
  }
}
