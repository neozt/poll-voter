import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PollService, CreatePollRequest } from '../../services/poll.service';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-create-poll',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTypographyModule,
    NzResultModule,
    NzAlertModule,
  ],
  providers: [NzMessageService],
  template: `
    <div class="max-w-3xl mx-auto p-4 md:p-8">
      <!-- Success State: Show created poll ID -->
      @if (createdPollId()) {
      <nz-card class="rounded-2xl shadow-lg border-0 text-center" [nzBordered]="false">
        <div class="py-8">
          <div
            class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6"
          >
            <span nz-icon nzType="check-circle" class="text-5xl text-emerald-500"></span>
          </div>
          <h2 class="text-3xl font-extrabold text-gray-800 mb-2">Poll Created!</h2>
          <p class="text-gray-500 mb-8">
            Share the ID below with anyone you want to invite to vote.
          </p>

          <div
            class="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl p-6 mb-8 mx-auto max-w-md"
          >
            <p class="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-2">
              Poll ID
            </p>
            <p class="text-2xl font-mono font-bold text-indigo-700 break-all">
              {{ createdPollId() }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              nz-button
              nzType="primary"
              nzSize="large"
              class="rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none font-semibold px-8"
              (click)="goToPoll()"
            >
              <span nz-icon nzType="eye"></span>
              View Poll
            </button>
            <button
              nz-button
              nzType="default"
              nzSize="large"
              class="rounded-xl font-semibold px-8"
              (click)="copyId()"
            >
              <span nz-icon nzType="copy"></span>
              Copy ID
            </button>
            <button
              nz-button
              nzSize="large"
              class="rounded-xl font-semibold px-8"
              (click)="resetForm()"
            >
              Create Another
            </button>
          </div>
        </div>
      </nz-card>
      }

      <!-- Form State -->
      @if (!createdPollId()) {
      <nz-card class="rounded-2xl shadow-lg border-0 overflow-hidden" [nzBordered]="false">
        <div class="text-center mb-8">
          <h1 nz-typography class="text-3xl font-extrabold text-gray-800 mb-2">
            Create a New Poll
          </h1>
          <p nz-typography nzType="secondary" class="text-base">
            Ask your audience anything. Add up to 10 options.
          </p>
        </div>

        <form nz-form [formGroup]="pollForm" (ngSubmit)="submitForm()" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label [nzSm]="24" nzRequired nzFor="title" class="font-semibold text-gray-700"
              >Poll Question</nz-form-label
            >
            <nz-form-control nzErrorTip="Please provide a question for your poll!">
              <nz-input-group nzSize="large" [nzPrefix]="titleIcon">
                <input
                  type="text"
                  nz-input
                  formControlName="title"
                  id="title"
                  placeholder="What would you like to ask?"
                />
              </nz-input-group>
              <ng-template #titleIcon><span nz-icon nzType="question-circle"></span></ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSm]="24" nzFor="description" class="font-semibold text-gray-700"
              >Description (Optional)</nz-form-label
            >
            <nz-form-control>
              <textarea
                nz-input
                formControlName="description"
                id="description"
                rows="2"
                placeholder="Provide additional context..."
              ></textarea>
            </nz-form-control>
          </nz-form-item>

          <div class="mt-6 mb-4">
            <h3 class="text-lg font-bold text-gray-800 border-b pb-2">Answer Options</h3>
          </div>

          <div formArrayName="options" class="space-y-3">
            @for (option of options.controls; track $index) {
            <div
              [formGroupName]="$index"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 group hover:border-indigo-300 transition-colors"
            >
              <div
                class="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm"
              >
                {{ $index + 1 }}
              </div>
              <nz-form-item class="flex-1 mb-0">
                <nz-form-control nzErrorTip="Required">
                  <input
                    type="text"
                    nz-input
                    formControlName="title"
                    placeholder="Option {{ $index + 1 }}"
                    class="border-0 bg-transparent focus:bg-white rounded-lg"
                  />
                </nz-form-control>
              </nz-form-item>
              @if (options.length > 2) {
              <button
                type="button"
                class="flex-shrink-0 w-8 h-8 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                (click)="removeOption($index)"
              >
                <span nz-icon nzType="close"></span>
              </button>
              }
            </div>
            }
          </div>

          <div class="mt-4 flex justify-center">
            <button
              type="button"
              nz-button
              nzType="dashed"
              class="w-full max-w-xs rounded-xl border-indigo-300 text-indigo-600 hover:border-indigo-500 hover:text-indigo-700 h-11"
              (click)="addOption()"
              [disabled]="options.length >= 10"
            >
              <span nz-icon nzType="plus"></span>
              Add Option
            </button>
          </div>

          <div class="mt-10 pt-6 border-t border-gray-100">
            <div class="flex gap-3">
              <button
                nz-button
                nzSize="large"
                type="button"
                class="rounded-xl flex-shrink-0"
                routerLink="/"
              >
                Back
              </button>
              <button
                nz-button
                nzType="primary"
                nzSize="large"
                class="flex-1 h-14 text-lg font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none shadow-md"
                [nzLoading]="isSubmitting()"
              >
                Launch Poll
              </button>
            </div>
          </div>
        </form>
      </nz-card>
      }
    </div>
  `,
})
export class CreatePollComponent {
  private fb = inject(FormBuilder);
  private pollService = inject(PollService);
  private message = inject(NzMessageService);
  private router = inject(Router);

  isSubmitting = signal(false);
  createdPollId = signal<string | null>(null);

  pollForm: FormGroup = this.fb.group({
    title: [null, [Validators.required, Validators.maxLength(200)]],
    description: [null, [Validators.maxLength(1000)]],
    options: this.fb.array([], [Validators.minLength(2)]),
  });

  get options(): FormArray {
    return this.pollForm.get('options') as FormArray;
  }

  constructor() {
    this.addOption();
    this.addOption();
  }

  createOptionFormGroup(): FormGroup {
    return this.fb.group({
      title: [null, [Validators.required, Validators.maxLength(100)]],
    });
  }

  addOption(): void {
    if (this.options.length < 10) {
      this.options.push(this.createOptionFormGroup());
    } else {
      this.message.warning('You can only add up to 10 options.');
    }
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    } else {
      this.message.warning('A poll must have at least 2 options.');
    }
  }

  submitForm(): void {
    if (this.pollForm.valid) {
      this.isSubmitting.set(true);
      const request: CreatePollRequest = this.pollForm.value;
      this.pollService.createPoll(request).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.createdPollId.set(res.poll_id);
        },
        error: (err) => {
          this.message.error('Failed to create poll. Please try again.');
          console.error(err);
          this.isSubmitting.set(false);
        },
      });
    } else {
      Object.values(this.pollForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.options.controls.forEach((group) => {
        Object.values((group as FormGroup).controls).forEach((control) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
      });
    }
  }

  copyId(): void {
    const id = this.createdPollId();
    if (id) {
      navigator.clipboard.writeText(id);
      this.message.success('Poll ID copied to clipboard!');
    }
  }

  goToPoll(): void {
    const id = this.createdPollId();
    if (id) {
      this.router.navigate(['/poll', id]);
    }
  }

  resetForm(): void {
    this.createdPollId.set(null);
    this.pollForm.reset();
    while (this.options.length > 0) {
      this.options.removeAt(0);
    }
    this.addOption();
    this.addOption();
  }
}
