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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getPosts(friendsOnly: boolean = false): Observable<any> {
    const url = friendsOnly ? `${this.apiUrl}posts/?friends_only=true` : `${this.apiUrl}posts/`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  createPost(dataPost: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}posts/`, dataPost, { headers: this.getHeaders() });
  }

  updatePost(postId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}posts/${postId}/`, data, {
      headers: this.getHeaders(),
    });
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}posts/${id}/`, { headers: this.getHeaders() });
  }

  likePost(dataLike: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/likes/`,
      dataLike,
      { headers: this.getHeaders() },
    );
  }

  disLikePost(postId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/likes/delete-by-post/${postId}/`, {
      headers: this.getHeaders()
    });
  }

  commentPost(dataComment: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/coment/`, dataComment, {
      headers: this.getHeaders(),
    });
  }

  updateComment(commentId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/coment/${commentId}/`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/coment/${commentId}/`, {
      headers: this.getHeaders(),
    });
  }
}
