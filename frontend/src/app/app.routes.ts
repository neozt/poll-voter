import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CreatePollComponent } from './components/create-poll/create-poll.component';
import { PollDetailComponent } from './components/poll-detail/poll-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create', component: CreatePollComponent },
  { path: 'poll/:id', component: PollDetailComponent },
  { path: '**', redirectTo: '' },
];
