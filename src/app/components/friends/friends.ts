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
  public usuarioService = inject(Usuario);
  private baseUrl = 'http://127.0.0.1:8000';

  currentUserId = Number(localStorage.getItem('user_id'));

  users = signal<any[]>([]);
  searchQuery = signal<string>('');
  loading = signal<boolean>(false);

  // 🕵️ Historial: Cargamos lo que el usuario ha buscado anteriormente
  recentSearches = signal<any[]>(JSON.parse(localStorage.getItem('recent_searches') || '[]'));

  // 🚰 El "Grifo": Un Subject es un tipo especial de Observable que permite lanzar datos
  private searchSubject = new Subject<string>();

  ngOnInit() {
    // Sincronizamos el estado social al entrar
    this.usuarioService.syncSocialState();

    // 🏗️ Configuramos la "Tubería" (Pipe) del buscador
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((term) => {
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

  searchUsers(event: any) {
    const query = event.target.value;
    this.searchQuery.set(query);

    if (query.length > 2) {
      this.searchSubject.next(query);
    } else {
      this.users.set([]);
      this.loading.set(false);
    }
  }

  // 🕵️ Métodos para el historial de búsquedas
  addToRecent(user: any) {
    const current = this.recentSearches().filter(u => u.id !== user.id);
    const updated = [user, ...current].slice(0, 5);
    this.recentSearches.set(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  }

  clearRecent() {
    this.recentSearches.set([]);
    localStorage.removeItem('recent_searches');
  }

  deleteFromRecent(userId: number) {
    const update = this.recentSearches().filter(u => u.id !== userId);
    this.recentSearches.set(update);
    localStorage.setItem('recent_searches', JSON.stringify(update));
  }
}
