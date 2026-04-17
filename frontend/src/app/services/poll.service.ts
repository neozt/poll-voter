import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PollOption {
  id: string;
  title: string;
  description?: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  isActive?: boolean;
  options: PollOption[];
}

export interface CreatePollRequest {
  title: string;
  description?: string;
  options: {
    title: string;
    description?: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPolls(): Observable<Poll[]> {
    return this.http.get<Poll[]>(`${this.apiUrl}/polls`);
  }

  getPoll(pollId: string): Observable<Poll> {
    return this.http.get<Poll>(`${this.apiUrl}/polls/${pollId}`);
  }

  createPoll(poll: CreatePollRequest): Observable<{ message: string; pollId: string }> {
    return this.http.post<{ message: string; pollId: string }>(`${this.apiUrl}/polls`, poll);
  }

  addVote(pollId: string, optionId: string, votedBy: string): Observable<{ message: string; voteId: string }> {
    return this.http.post<{ message: string; voteId: string }>(
      `${this.apiUrl}/polls/${pollId}/votes`,
      { optionId, votedBy }
    );
  }

  joinPoll(pollId: string, participantId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/polls/${pollId}/participants`,
      {participantId, action: 'HEARTBEAT'}
    );
  }

  leavePoll(pollId: string, participantId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/polls/${pollId}/participants`,
      {participantId, action: 'LEAVE_POLL'}
    );
  }
}
