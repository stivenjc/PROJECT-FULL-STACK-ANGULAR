import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../services/usuario';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css'
})
export class UserCardComponent {
  @Input() user: any;
  @Input() status: string = 'none';

  @Output() follow = new EventEmitter<{ id: number, private: boolean }>();
  @Output() unfollow = new EventEmitter<number>();

  usuarioService = inject(Usuario);

}
