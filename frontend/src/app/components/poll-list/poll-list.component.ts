import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollService, Poll } from '../../services/poll.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'app-poll-list',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzTypographyModule,
    NzSpinModule,
    NzProgressModule
  ],
  template: `
    <div class="max-w-4xl mx-auto p-4 md:p-8">
      <h1 nz-typography class="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Active Polls</h1>
      
      <div *ngIf="loading" class="flex justify-center my-12">
        <nz-spin nzSimple nzSize="large"></nz-spin>
      </div>

      <div *ngIf="!loading && polls.length === 0" class="text-center text-gray-500 my-12">
        <p>No active polls currently available. Be the first to create one!</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" *ngIf="!loading">
        <nz-card 
          *ngFor="let poll of polls" 
          [nzTitle]="poll.title" 
          nzHoverable 
          class="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
        >
          <p nz-typography nzType="secondary" class="mb-6 whitespace-pre-wrap">{{ poll.description }}</p>
          
          <div class="space-y-4">
            <div *ngFor="let option of poll.options" class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex justify-between items-center mb-2">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-800">{{ option.title }}</span>
                  <span *ngIf="option.description" class="text-xs text-gray-500">{{ option.description }}</span>
                </div>
                
                <button 
                  nz-button 
                  nzType="primary" 
                  nzShape="round" 
                  (click)="vote(poll.id!, option.id!)"
                  [nzLoading]="votingOptionId === option.id"
                  [disabled]="votingOptionId !== null"
                  class="bg-indigo-600 hover:bg-indigo-700 border-none shadow-sm"
                >
                  Vote
                </button>
              </div>

              <div class="mt-2">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{{ option.vote_count || 0 }} {{ (option.vote_count === 1 ? 'vote' : 'votes') }}</span>
                  <span>{{ calculatePercentage(poll, option.vote_count || 0) | number:'1.0-0' }}%</span>
                </div>
                <nz-progress 
                  [nzPercent]="calculatePercentage(poll, option.vote_count || 0)" 
                  nzStatus="normal"
                  [nzShowInfo]="false"
                  nzStrokeColor="#4f46e5"
                ></nz-progress>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>Created: {{ poll.created_at | date:'mediumDate' }}</span>
            <span class="font-medium text-indigo-500">{{ getTotalVotes(poll) }} Total Votes</span>
          </div>
        </nz-card>
      </div>
    </div>
  `
})
export class PollListComponent implements OnInit {
  polls: Poll[] = [];
  loading = true;
  votingOptionId: string | null = null;
  
  private pollService = inject(PollService);
  private message = inject(NzMessageService);

  ngOnInit() {
    this.loadPolls();
  }

  loadPolls() {
    this.loading = true;
    this.pollService.getPolls().subscribe({
      next: (data) => {
        this.polls = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to load polls. Please try again later.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  vote(pollId: string, optionId: string) {
    this.votingOptionId = optionId;
    this.pollService.addVote(pollId, optionId).subscribe({
      next: () => {
        this.message.success('Your vote has been cast successfully!');
        this.loadPolls(); // Refresh the data to show updated counts
        this.votingOptionId = null;
      },
      error: (err) => {
        this.message.error('Failed to cast vote. It might be an invalid request.');
        this.votingOptionId = null;
        console.error(err);
      }
    });
  }

  getTotalVotes(poll: Poll): number {
    return poll.options.reduce((total, opt) => total + (opt.vote_count || 0), 0);
  }

  calculatePercentage(poll: Poll, voteCount: number): number {
    const total = this.getTotalVotes(poll);
    if (total === 0) return 0;
    return (voteCount / total) * 100;
  }
}
