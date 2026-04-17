import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { events, EventsChannel } from 'aws-amplify/api';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Poll, PollOption, PollService } from '../../services/poll.service';

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
    () => this.poll()?.options.reduce((sum, o) => sum + (o.voteCount || 0), 0) ?? 0
  );
  userId = signal('');
  recentVotes = signal<Record<string, number>>({}); // Maps optionId to count of active indicators
  participantsCount = signal(1);

  private channel?: EventsChannel;
  private participantsChannel?: EventsChannel;
  private participantsHeartbeatInterval?: number;
  private readonly HEARTBEAT_INTERVAL = 10000;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.pollId.set(id);
    this.userId.set(crypto.randomUUID());
    this.loadPoll();
    this.subscribeToPollUpdates();
    this.subscribeToParticipantsCount();
  }

  ngOnDestroy(): void {
    if (this.channel) {
      this.channel.close();
    }
    if (this.participantsChannel) {
      this.participantsChannel.close();
    }
    if (this.participantsHeartbeatInterval) {
      clearInterval(this.participantsHeartbeatInterval);
      this.pollService.leavePoll(this.pollId(), this.userId());
    }
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

  async subscribeToParticipantsCount() {
    this.pollService.joinPoll(this.pollId(), this.userId()).subscribe();

    this.participantsHeartbeatInterval = setInterval(
      () => this.pollService.joinPoll(this.pollId(), this.userId()).subscribe(),
      this.HEARTBEAT_INTERVAL
    );

    try {
      const channel = `participants/${this.pollId()}`;
      this.participantsChannel = await events.connect(channel);
      this.participantsChannel.subscribe({
        next: (message: any) => {
          this.participantsCount.set(message.event?.participantsCount ?? 0);
        },
        error: (e) => {
          console.error(`Error subscribing to channel ${channel}`, e)
        }
      });
    } catch (err) {
      console.error('Failed to subscribe to participants count updates', err);
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
      return tally ? { ...opt, voteCount: tally[1] } as PollOption : opt;
    });

    this.poll.set({ ...currentPoll, options: newOptions });

    // Indicator if someone else voted
    if (payload.latestVote?.votedBy !== this.userId()) {
      const optionId = payload.latestVote.optionId;

      // Increment count for this option
      this.recentVotes.update((prev) => ({
        ...prev,
        [optionId]: (prev[optionId] || 0) + 1,
      }));

      // Decrement after 2 seconds
      setTimeout(() => {
        this.recentVotes.update((prev) => {
          const newCount = (prev[optionId] || 0) - 1;
          if (newCount <= 0) {
            const { [optionId]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [optionId]: newCount };
        });
      }, 1000);
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
