import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PollService, Poll } from '../../services/poll.service';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-poll-detail',
  imports: [
    CommonModule,
    NzButtonModule,
    NzTypographyModule,
    NzSpinModule,
    NzResultModule,
    NzTagModule,
    NzIconModule,
  ],
  providers: [NzMessageService],
  templateUrl: 'poll-detail.component.html',
})
export class PollDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pollService = inject(PollService);
  private message = inject(NzMessageService);

  poll = signal<Poll | null>(null);
  loading = signal(true);
  notFound = signal(false);
  pollId = signal('');
  votingOptionId = signal<string | null>(null);

  totalVotes = computed(
    () => this.poll()?.options.reduce((sum, o) => sum + (o.vote_count || 0), 0) ?? 0
  );

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.pollId.set(id);
    this.loadPoll();
    // Poll every 5 seconds
    this.pollInterval = setInterval(() => this.loadPoll(true), 5000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadPoll(silent = false): void {
    if (!silent) {
      this.loading.set(true);
    }
    this.pollService.getPoll(this.pollId()).subscribe({
      next: (data) => {
        this.poll.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.notFound.set(true);
          if (this.pollInterval) {
            clearInterval(this.pollInterval);
          }
        } else if (!silent) {
          this.message.error('Failed to load poll.');
          console.error(err);
        }
      },
    });
  }

  vote(optionId: string): void {
    if (this.votingOptionId()) {
      return;
    } // debounce concurrent votes
    this.votingOptionId.set(optionId);
    this.pollService.addVote(this.pollId(), optionId).subscribe({
      next: () => {
        this.votingOptionId.set(null);
        this.loadPoll(true); // immediately refresh tallies
      },
      error: (err) => {
        this.message.error('Failed to cast vote. Please try again.');
        this.votingOptionId.set(null);
        console.error(err);
      },
    });
  }

  calculatePercentage(voteCount: number): number {
    const total = this.totalVotes();
    if (total === 0) {
      return 0;
    }
    return (voteCount / total) * 100;
  }

  optionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, ...
  }

  copyId(): void {
    navigator.clipboard.writeText(this.pollId());
    this.message.success('Poll ID copied!');
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
