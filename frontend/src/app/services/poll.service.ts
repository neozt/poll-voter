import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PollOption {
  id?: string;
  title: string;
  description?: string;
  vote_count?: number;
}

export interface Poll {
  id?: string;
  title: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  is_active?: boolean;
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
  providedIn: 'root'
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

  createPoll(poll: CreatePollRequest): Observable<{ message: string, poll_id: string }> {
    return this.http.post<{ message: string, poll_id: string }>(`${this.apiUrl}/polls`, poll);
  }

  addVote(pollId: string, optionId: string): Observable<{ message: string, voteId: string }> {
    return this.http.post<{ message: string, voteId: string }>(
      `${this.apiUrl}/polls/${pollId}/votes`,
      { optionId }
    );
  }
}
