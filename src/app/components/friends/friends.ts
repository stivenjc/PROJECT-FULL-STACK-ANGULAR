import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../services/usuario';
import { UserCardComponent } from '../user-card/user-card';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, RouterLink, UserCardComponent],
  templateUrl: './friends.html',
  styleUrl: './friends.css',
})
export class FriendsComponent implements OnInit {
  private usuarioService = inject(Usuario);
  private baseUrl = 'http://127.0.0.1:8000';

  currentUserId = Number(localStorage.getItem('user_id'));

  users = signal<any[]>([]);
  pendingRequests = signal<any[]>([]);
  sentRequests = signal<any[]>([]);
  friends = signal<any[]>([]);
  searchQuery = signal<string>('');
  loading = signal<boolean>(false);

  // 🚰 El "Grifo": Un Subject es un tipo especial de Observable que permite lanzar datos
  private searchSubject = new Subject<string>();

  // Computed Signal: This will automatically update whenever 'friends' or 'searchQuery' changes.
  filteredFriends = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allFriends = this.friends();

    if (!query) return allFriends;

    return allFriends.filter(f => {
      return f.receiver_data?.username?.toLowerCase().includes(query) ||
        f.receiver_data?.first_name?.toLowerCase().includes(query) ||
        f.receiver_data?.last_name?.toLowerCase().includes(query);
    });
  });

  ngOnInit() {
    this.loadAll();

    // 🏗️ Configuramos la "Tubería" (Pipe) del buscador
    this.searchSubject.pipe(
      debounceTime(400),        // ⏱️ Espera 400ms después de que el usuario deje de escribir
      distinctUntilChanged(),   // 👥 No busques si el texto es igual al anterior
      switchMap((term) => {     // 🔄 Si hay una búsqueda en marcha, la cancela y empieza la nueva
        this.loading.set(true);
        return this.usuarioService.getUsers(term);
      })
    ).subscribe({
      next: (data: any) => {
        this.users.set(data.results || data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.loading.set(false);
      }
    });
  }

  getPhotoUrl(photo: string | null): string {
    return this.usuarioService.getPhotoUrl(photo);
  }

  loadAll() {
    this.loading.set(true);

    this.usuarioService.getFriendRequests().subscribe({
      next: (data: any) => {
        const results = data.results || data;
        this.pendingRequests.set(results);
        this.usuarioService.pendingRequestsCount.set(results.length);
      },
      error: (err: any) => console.error('Error cargando solicitudes:', err),
    });

    this.usuarioService.getSentRequests().subscribe({
      next: (data: any) => this.sentRequests.set(data.results || data),
      error: (err: any) => console.error('Error cargando solicitudes enviadas:', err),
    });

    this.usuarioService.getConfirmedFriends().subscribe({
      next: (data: any) => this.friends.set(data.results || data),
      error: (err: any) => console.error('Error cargando amigos:', err),
      complete: () => this.loading.set(false),
    });
  }

  searchUsers(event: any) {
    const query = event.target.value;
    this.searchQuery.set(query);

    if (query.length > 2) {
      // 🚀 En lugar de llamar a la API directamente, lanzamos el texto al "Grifo" (Subject)
      this.searchSubject.next(query);
    } else {
      this.users.set([]);
      this.loading.set(false);
    }
  }

  getFriendshipStatus(
    userId: number,
  ): 'none' | 'following' | 'pending_received' | 'pending_sent' | 'is_me' {
    if (userId === this.currentUserId) return 'is_me';

    if (this.friends().some((f) => f.receiver === userId && f.friend === true)) {
      return 'following';
    }

    if (this.pendingRequests().some((f) => f.transmitter === userId)) {
      return 'pending_received';
    }

    if (this.sentRequests().some((f) => f.receiver === userId)) {
      return 'pending_sent';
    }

    return 'none';
  }

  sendRequest(userId: number, is_private: boolean) {
    if (is_private) {
      this.usuarioService.sendFriendRequest(userId, false).subscribe({
        next: () => {
          alert('Esta cuenta es privada, se ha enviado una solicitud para seguir');
          this.loadAll();
        },
        error: (err) => alert('Ya has enviado una solicitud a este usuario o ya son amigos.'),
      });
    } else {
      this.usuarioService.sendFriendRequest(userId, true).subscribe({
        next: () => {
          alert('Comensaste a seguir a este usuario');
          this.loadAll();
        },
        error: (err) => alert('Ya has enviado una solicitud a este usuario o ya son amigos.'),
      });
    }
  }

  acceptRequest(requestId: number) {
    this.usuarioService.acceptFriendRequest(requestId).subscribe({
      next: () => {
        alert('Solicitud aceptada');
        this.loadAll();
      },
      error: (err) => console.error('Error al aceptar solicitud:', err),
    });
  }

  rejectRequest(requestId: number) {
    if (confirm('¿Estás seguro de que quieres rechazar esta solicitud?')) {
      this.usuarioService.deleteFriendship(requestId).subscribe({
        next: () => {
          this.loadAll();
        },
        error: (err) => console.error('Error al rechazar solicitud:', err),
      });
    }
  }
}
