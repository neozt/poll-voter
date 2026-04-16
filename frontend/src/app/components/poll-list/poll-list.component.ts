import { Component, OnInit, inject, signal } from '@angular/core';
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
  providers: [NzMessageService],
  template: `
    <div class="max-w-4xl mx-auto p-4 md:p-8">
      <h1 nz-typography class="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Active Polls</h1>

      @if (loading()) {
        <div class="flex justify-center my-12">
          <nz-spin nzSimple nzSize="large" [nzSpinning]="loading()"></nz-spin>
        </div>
      }

      @if (!loading() && polls().length === 0) {
        <div class="text-center text-gray-500 my-12">
          <p>No active polls currently available. Be the first to create one!</p>
        </div>
      }

      @if (!loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (poll of polls(); track poll.id) {
            <nz-card
              [nzTitle]="poll.title"
              nzHoverable
              class="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <p nz-typography nzType="secondary" class="mb-6 whitespace-pre-wrap">{{ poll.description }}</p>

              <div class="space-y-4">
                @for (option of poll.options; track option.id) {
                  <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex justify-between items-center mb-2">
                      <div class="flex flex-col">
                        <span class="font-medium text-gray-800">{{ option.title }}</span>
                        @if (option.description) {
                          <span class="text-xs text-gray-500">{{ option.description }}</span>
                        }
                      </div>

                      <button
                        nz-button
                        nzType="primary"
                        nzShape="round"
                        (click)="vote(poll.id!, option.id!)"
                        [nzLoading]="votingOptionId() === option.id"
                        [disabled]="votingOptionId() !== null"
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
                }
              </div>

              <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span>Created: {{ poll.created_at | date:'mediumDate' }}</span>
                <span class="font-medium text-indigo-500">{{ getTotalVotes(poll) }} Total Votes</span>
              </div>
            </nz-card>
          }
        </div>
      }
    </div>
  `
})
export class PollListComponent implements OnInit {
  polls = signal<Poll[]>([]);
  loading = signal(true);
  votingOptionId = signal<string | null>(null);

  private pollService = inject(PollService);
  private message = inject(NzMessageService);

  ngOnInit() {
    this.loadPolls();
  }

  loadPolls() {
    this.loading.set(true);
    this.pollService.getPolls().subscribe({
      next: (data) => {
        console.log("data", data);
        this.polls.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.message.error('Failed to load polls. Please try again later.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  vote(pollId: string, optionId: string) {
    this.votingOptionId.set(optionId);
    this.pollService.addVote(pollId, optionId).subscribe({
      next: () => {
        this.message.success('Your vote has been cast successfully!');
        this.loadPolls(); // Refresh the data to show updated counts
        this.votingOptionId.set(null);
      },
      error: (err) => {
        this.message.error('Failed to cast vote. It might be an invalid request.');
        this.votingOptionId.set(null);
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
