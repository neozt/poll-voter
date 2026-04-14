import { Routes } from '@angular/router';
import { PollListComponent } from './components/poll-list/poll-list.component';
import { CreatePollComponent } from './components/create-poll/create-poll.component';

export const routes: Routes = [
  { path: '', component: PollListComponent },
  { path: 'create', component: CreatePollComponent },
  { path: '**', redirectTo: '' }
];
