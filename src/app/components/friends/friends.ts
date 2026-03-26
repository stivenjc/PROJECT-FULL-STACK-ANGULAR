import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../services/usuario';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friends.html',
  styleUrl: './friends.css'
})
export class FriendsComponent implements OnInit {
  private usuarioService = inject(Usuario);
  private baseUrl = 'http://127.0.0.1:8000'; // Base para las imágenes

  // ID del usuario actual para filtrar en el HTML
  currentUserId = Number(localStorage.getItem('user_id'));

  // Signals para manejar el estado reactivo
  users = signal<any[]>([]);
  pendingRequests = signal<any[]>([]);
  sentRequests = signal<any[]>([]);
  friends = signal<any[]>([]);
  searchQuery = signal<string>(''); // Nueva señal para búsqueda
  loading = signal<boolean>(false);

  ngOnInit() {
    this.loadAll();
  }

  // Ayudante para formatear la URL de la foto
  getPhotoUrl(photo: string | null): string {
    if (!photo) return '';
    if (photo.startsWith('http')) return photo;
    return `${this.baseUrl}${photo.startsWith('/') ? '' : '/'}${photo}`;
  }

  loadAll() {
    this.loading.set(true);

    // Solicitudes RECIBIDAS
    this.usuarioService.getFriendRequests().subscribe({
      next: (data: any) => {
        const results = data.results || data;
        this.pendingRequests.set(results);
        // === ACTUALIZAR ESTADO GLOBAL ===
        this.usuarioService.pendingRequestsCount.set(results.length);
      },
      error: (err: any) => console.error('Error cargando solicitudes:', err)
    });

    // Solicitudes ENVIADAS
    this.usuarioService.getSentRequests().subscribe({
      next: (data: any) => this.sentRequests.set(data.results || data),
      error: (err: any) => console.error('Error cargando solicitudes enviadas:', err)
    });

    // Amigos CONFIRMADOS
    this.usuarioService.getConfirmedFriends().subscribe({
      next: (data: any) => this.friends.set(data.results || data),
      error: (err: any) => console.error('Error cargando amigos:', err),
      complete: () => this.loading.set(false)
    });
  }

  // Método para buscar usuarios (se activa al escribir o darle a un botón)
  searchUsers(event: any) {
    const query = event.target.value;
    this.searchQuery.set(query);

    if (query.length > 2) { // Empezar a buscar después de 3 caracteres
      this.usuarioService.getUsers(query).subscribe({
        next: (data: any) => this.users.set(data.results || data),
        error: (err: any) => console.error('Error en búsqueda:', err)
      });
    } else {
      this.users.set([]); // Limpiar si borra la búsqueda
    }
  }

  // Determinar el estado de relación con un usuario de la búsqueda
  getFriendshipStatus(userId: number): 'none' | 'friend' | 'pending_received' | 'pending_sent' | 'is_me' {
    if (userId === this.currentUserId) return 'is_me';

    // Ya son amigos (friend == true)
    if (this.friends().some(f => (f.transmitter === userId || f.receiver === userId) && f.friend === true)) {
      return 'friend';
    }

    // Solicitud que YO recibí (pendingRequests)
    if (this.pendingRequests().some(f => f.transmitter === userId)) {
      return 'pending_received';
    }

    // Solicitud que YO envié (sentRequests)
    if (this.sentRequests().some(f => f.receiver === userId)) {
      return 'pending_sent';
    }

    return 'none';
  }

  sendRequest(userId: number) {
    this.usuarioService.sendFriendRequest(userId).subscribe({
      next: () => {
        alert('Solicitud enviada');
        this.loadAll();
      },
      error: (err) => alert('Ya has enviado una solicitud a este usuario o ya son amigos.')
    });
  }

  acceptRequest(requestId: number) {
    this.usuarioService.acceptFriendRequest(requestId).subscribe({
      next: () => {
        alert('Solicitud aceptada');
        this.loadAll();
      },
      error: (err) => console.error('Error al aceptar solicitud:', err)
    });
  }

  rejectRequest(requestId: number) {
    if (confirm('¿Estás seguro de que quieres rechazar esta solicitud?')) {
      this.usuarioService.deleteFriendship(requestId).subscribe({
        next: () => {
          alert('Solicitud rechazada/cancelada');
          this.loadAll();
        },
        error: (err) => console.error('Error al rechazar solicitud:', err)
      });
    }
  }
}
