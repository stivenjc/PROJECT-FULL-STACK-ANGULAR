import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/';

  pendingRequestsCount = signal<number>(0);
  currentUser = signal<any>(null);

  // 🛡️ Almacén Central de Amistades (Store)
  friendsList = signal<any[]>([]);
  pendingReceived = signal<any[]>([]);
  pendingSent = signal<any[]>([]);

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Sincroniza todo el estado social con el servidor
  syncSocialState() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    this.getFriendRequests().subscribe(data => {
      const list = data.results || data;
      this.pendingReceived.set(list);
      this.pendingRequestsCount.set(list.length);
    });

    this.getSentRequests().subscribe(data => {
      this.pendingSent.set(data.results || data);
    });

    this.getConfirmedFriends().subscribe(data => {
      this.friendsList.set(data.results || data);
    });
  }

  // Ayudante para encontrar una relación de amistad por ID de usuario
  getFriendship(userId: number) {
    return this.friendsList().find(f =>
      (f.receiver === userId) || (f.transmitter === userId)
    ) ||
      this.pendingSent().find(f => f.receiver === userId) ||
      this.pendingReceived().find(f => f.transmitter === userId);
  }

  updateUser(userId: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}users/${userId}/`, data, {
      headers: this.getHeaders(),
    });
  }

  getPhotoUrl(photo: string | null): string {
    if (!photo) return 'https://ui-avatars.com/api/?name=User';
    if (photo.startsWith('http')) return photo;
    return `http://127.0.0.1:8000${photo.startsWith('/') ? '' : '/'}${photo}`;
  }

  registrarUsuario(dataUser: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register/users/`, dataUser);
  }

  loginUser(dataUser: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}login/`, dataUser);
  }

  getUsers(search: string = ''): Observable<any> {
    const url = search ? `${this.apiUrl}users/?search=${search}` : `${this.apiUrl}users/`;
    return this.http.get<any>(url, {
      headers: this.getHeaders(),
    });
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}users/${userId}/`, {
      headers: this.getHeaders(),
    });
  }

  getFriendRequests(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}friend/?friend=false&receiver=${localStorage.getItem('user_id')}`, {
      headers: this.getHeaders(),
    });
  }

  getSentRequests(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}friend/?friend=false&transmitter=${localStorage.getItem('user_id')}`, {
      headers: this.getHeaders(),
    });
  }

  getConfirmedFriends(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}friend/my-friends/`, {
      headers: this.getHeaders(),
    });
  }

  sendFriendRequest(receiverId: number, friend: boolean = false): Observable<any> {
    const obs = this.http.post<any>(
      `${this.apiUrl}friend/`,
      { transmitter: localStorage.getItem('user_id'), receiver: receiverId, friend: friend },
      { headers: this.getHeaders() },
    );
    // Sincronizamos después de enviar
    obs.subscribe(() => this.syncSocialState());
    return obs;
  }

  acceptFriendRequest(requestId: number): Observable<any> {
    const obs = this.http.patch<any>(
      `${this.apiUrl}friend/${requestId}/`,
      { friend: true },
      { headers: this.getHeaders() },
    );
    // Sincronizamos después de aceptar
    obs.subscribe(() => this.syncSocialState());
    return obs;
  }

  deleteFriendship(requestId: number): Observable<any> {
    const obs = this.http.delete<any>(`${this.apiUrl}friend/${requestId}/`, {
      headers: this.getHeaders(),
    });
    // Sincronizamos después de borrar
    obs.subscribe(() => this.syncSocialState());
    return obs;
  }

  checkinIsFriend(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}friend/check-friend/${userId}/`, {
      headers: this.getHeaders(),
    });
  }

  logoutBackend(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}logout/`, { 'refresh_token': localStorage.getItem('refresh_token') }, {
      headers: this.getHeaders(),
    });
  }

  followUser(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}friend/follow/${userId}/`, {
      headers: this.getHeaders(),
    });
  }
}
