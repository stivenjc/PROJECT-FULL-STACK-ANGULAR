import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/';

  // === GLOBAL STATE (STORE) ===
  // Este es el numerito que compartiremos entre el Sidebar y la página de Amigos
  pendingRequestsCount = signal<number>(0);

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  registrarUsuario(dataUser: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register/users/`, dataUser);
  }

  loginUser(dataUser: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}login/`, dataUser);
  }

  // --- MÉTODOS DE AMIGOS ---

  // Obtener usuarios con opción de búsqueda por username
  getUsers(search: string = ''): Observable<any> {
    const url = search ? `${this.apiUrl}users/?search=${search}` : `${this.apiUrl}users/`;
    return this.http.get<any>(url, {
      headers: this.getHeaders(),
    });
  }

  // Obtener solicitudes de amistad recibidas (donde soy el receptor y friend=false)
  getFriendRequests(): Observable<any> {
    // Usamos el filtro de Django: ?receiver=MI_ID&friend=false
    // Nota: El backend debería filtrar por el usuario autenticado automáticamente si es posible,
    // o podemos pasar el parámetro si el ViewSet lo permite.
    return this.http.get<any>(`${this.apiUrl}friend/?friend=false&receiver=${localStorage.getItem('user_id')}`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener solicitudes ENVIADAS por mí
  getSentRequests(): Observable<any> {
    // Aquí el backend sabrá que soy el transmitter por el Token
    // O si necesitas filtrar: ?transmitter=MI_ID&friend=false
    return this.http.get<any>(`${this.apiUrl}friend/?friend=false&transmitter=${localStorage.getItem('user_id')}`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener lista de amigos confirmados
  getConfirmedFriends(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}friend/my-friends/`, {
      headers: this.getHeaders(),
    });
  }

  // Enviar solicitud de amistad
  sendFriendRequest(receiverId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}friend/`,
      { transmitter: localStorage.getItem('user_id'), receiver: receiverId },
      { headers: this.getHeaders() },
    );
  }

  // Aceptar solicitud (poner friend: true)
  acceptFriendRequest(requestId: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}friend/${requestId}/`,
      { friend: true },
      { headers: this.getHeaders() },
    );
  }

  // Rechazar o Cancelar solicitud (Borrar registro)
  deleteFriendship(requestId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}friend/${requestId}/`, {
      headers: this.getHeaders(),
    });
  }
}
