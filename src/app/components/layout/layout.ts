import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Usuario } from '../../services/usuario';
import { Comments } from "../comments/comments";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  public usuarioService = inject(Usuario);
  public user_id = localStorage.getItem("user_id");
  ngOnInit() {
    this.usuarioService.getUserById(Number(this.user_id)).subscribe(user => {
      this.usuarioService.currentUser.set(user);
    })
  }

}
