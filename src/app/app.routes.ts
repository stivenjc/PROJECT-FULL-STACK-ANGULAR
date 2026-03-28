import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Posts } from './components/posts/posts';
import { FriendsComponent } from './components/friends/friends';
import { ProfileComponent } from './components/profile/profile';
import { authGuard } from './guards/auth-guard';

import { Layout } from './components/layout/layout';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'posts', component: Posts },
      { path: 'friends', component: FriendsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/:id', component: ProfileComponent },
      { path: '', redirectTo: 'posts', pathMatch: 'full' }
    ]
  },
];
