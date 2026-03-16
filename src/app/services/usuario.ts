import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/';

  constructor() {}

  registrarUsuario(dataUser: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register/users/`, dataUser);
  }

  loginUser(dataUser: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}login/`, dataUser);
  }
}
