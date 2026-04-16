import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { events, EventsChannel } from 'aws-amplify/api';
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

  private channel?: EventsChannel;
  userId = signal('');
  someoneElseVoting = signal<string | null>(null); // Option ID of someone else's vote

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.pollId.set(id);
    this.initUserId();
    this.loadPoll();
    this.subscribeToPollUpdates();
  }

  ngOnDestroy(): void {
    if (this.channel) {
      this.channel.close();
    }
  }

  initUserId(): void {
    const id = crypto.randomUUID();
    this.userId.set(id);
  }

  async subscribeToPollUpdates() {
    try {
      const channel = `/polls/${this.pollId()}`;
      this.channel = await events.connect(channel);
      this.channel.subscribe({
        next: (event: any) => {
          this.handleRealTimeUpdate(event.event);
        },
        error: (e) => {
          console.error(`Error subscribing to channel /polls/${this.pollId}`, e)
        }
      });
    } catch (err) {
      console.error('Failed to subscribe to poll updates', err);
    }
  }

  handleRealTimeUpdate(payload: any) {
    const currentPoll = this.poll();
    if (!currentPoll) {
      return;
    }

    // Update the local poll object with new tallies
    const newOptions = currentPoll.options.map((opt) => {
      const tally = payload.voteTally.find((t: [string, number]) => t[0] === opt.id);
      return tally ? { ...opt, vote_count: tally[1] } : opt;
    });

    this.poll.set({ ...currentPoll, options: newOptions });

    // Indicator if someone else voted
    if (payload.latestVote?.votedBy !== this.userId()) {
      this.someoneElseVoting.set(payload.latestVote.optionId);
      setTimeout(() => {
        if (this.someoneElseVoting() === payload.latestVote.optionId) {
          this.someoneElseVoting.set(null);
        }
      }, 2000);
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
    this.pollService.addVote(this.pollId(), optionId, this.userId()).subscribe({
      next: () => {
        this.votingOptionId.set(null);
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
