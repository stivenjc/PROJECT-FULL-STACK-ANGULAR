import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/';

  constructor() { }

  // Helper method para obtener las cabeceras con el token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // O el formato que use tu backend, ej: 'Token ${token}'
    });
  }

  // Obtener todos los posts
  getPosts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}posts/`, { headers: this.getHeaders() });
  }

  // Crear un nuevo post
  createPost(dataPost: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}posts/`, dataPost, { headers: this.getHeaders() });
  }

  // Dar 'Like' a un post
  likePost(postId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}posts/${postId}/like/`, {}, { headers: this.getHeaders() });
  }

  // Comentar en un post
  commentPost(postId: number, dataComment: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}posts/${postId}/comments/`, dataComment, { headers: this.getHeaders() });
  }
}
