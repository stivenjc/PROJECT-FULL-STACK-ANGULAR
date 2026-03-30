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

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
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

  sendFriendRequest(receiverId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}friend/`,
      { transmitter: localStorage.getItem('user_id'), receiver: receiverId },
      { headers: this.getHeaders() },
    );
  }

  acceptFriendRequest(requestId: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}friend/${requestId}/`,
      { friend: true },
      { headers: this.getHeaders() },
    );
  }

  deleteFriendship(requestId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}friend/${requestId}/`, {
      headers: this.getHeaders(),
    });
  }

  checkinIsFriend(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}friend/check-friend/${userId}/`, {
      headers: this.getHeaders(),
    });
  }
}
