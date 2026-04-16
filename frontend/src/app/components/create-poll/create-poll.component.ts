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
  templateUrl: 'create-poll.component.html',
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
