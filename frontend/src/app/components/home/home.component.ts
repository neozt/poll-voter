import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzInputModule, NzIconModule],
  providers: [NzMessageService],
  template: `
    <div class="min-h-[calc(100vh-134px)] flex flex-col items-center justify-center px-4 py-16">
      <!-- Hero -->
      <div class="text-center mb-16">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600 shadow-lg mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>
        <h1 class="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">PollVoter</h1>
        <p class="text-xl text-gray-500 max-w-md mx-auto">
          Create polls instantly and share them with anyone. Real-time voting, zero friction.
        </p>
      </div>

      <!-- Action Cards -->
      <div class="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Create -->
        <div
          class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center text-center border border-gray-100 cursor-pointer group"
          (click)="goToCreate()"
        >
          <div
            class="w-16 h-16 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors flex items-center justify-center mb-5"
          >
            <span nz-icon nzType="plus-circle" class="text-3xl text-indigo-600"></span>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Create a Poll</h2>
          <p class="text-gray-500 text-sm mb-6">
            Set up a new poll with custom options and share it with your audience.
          </p>
          <button
            nz-button
            nzType="primary"
            nzSize="large"
            class="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none font-semibold"
            (click)="goToCreate()"
          >
            Get Started
          </button>
        </div>

        <!-- Join -->
        <div
          class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center text-center border border-gray-100"
        >
          <div class="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
            <span nz-icon nzType="login" class="text-3xl text-emerald-600"></span>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Join a Poll</h2>
          <p class="text-gray-500 text-sm mb-4">
            Enter the poll ID shared by the creator to cast your vote.
          </p>
          <div class="w-full space-y-3">
            <nz-input-group
              nzSize="large"
              [nzSuffix]="searchSuffix"
              class="rounded-xl overflow-hidden"
            >
              <input
                nz-input
                [(ngModel)]="joinId"
                (keyup.enter)="joinPoll()"
                placeholder="Enter poll ID..."
                class="text-center font-mono"
              />
            </nz-input-group>
            <ng-template #searchSuffix>
              <span nz-icon nzType="search" class="text-gray-400"></span>
            </ng-template>
            <button
              nz-button
              nzType="default"
              nzSize="large"
              class="w-full rounded-xl border-emerald-500 text-emerald-600 hover:text-emerald-700 hover:border-emerald-700 font-semibold"
              (click)="joinPoll()"
              [disabled]="!joinId.trim()"
            >
              Join Poll
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  private router = inject(Router);
  private message = inject(NzMessageService);

  joinId = '';

  goToCreate(): void {
    this.router.navigate(['/create']);
  }

  joinPoll(): void {
    const id = this.joinId.trim();
    if (!id) {
      this.message.warning('Please enter a Poll ID.');
      return;
    }
    this.router.navigate(['/poll', id]);
  }
}
