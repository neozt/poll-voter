import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PollService, CreatePollRequest } from '../../services/poll.service';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-create-poll',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTypographyModule
  ],
  template: `
    <div class="max-w-3xl mx-auto p-4 md:p-8">
      <nz-card class="rounded-2xl shadow-lg border-0 overflow-hidden" [nzBordered]="false">
        <div class="text-center mb-8">
          <h1 nz-typography class="text-3xl font-extrabold text-gray-800 mb-2">Create a New Poll</h1>
          <p nz-typography nzType="secondary" class="text-base">Ask your audience anything. Add up to 10 options.</p>
        </div>

        <form nz-form [formGroup]="pollForm" (ngSubmit)="submitForm()" nzLayout="vertical">
          
          <nz-form-item>
            <nz-form-label [nzSm]="24" nzRequired nzFor="title" class="font-semibold text-gray-700">Poll Title</nz-form-label>
            <nz-form-control nzErrorTip="Please provide a title for your poll!">
              <nz-input-group nzSize="large" [nzPrefix]="titleIcon">
                <input type="text" nz-input formControlName="title" id="title" placeholder="What would you like to ask?" class="rounded-lg" />
              </nz-input-group>
              <ng-template #titleIcon><span nz-icon nzType="question-circle"></span></ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSm]="24" nzFor="description" class="font-semibold text-gray-700">Description (Optional)</nz-form-label>
            <nz-form-control>
              <textarea nz-input formControlName="description" id="description" rows="3" placeholder="Provide additional context or details..." class="rounded-lg"></textarea>
            </nz-form-control>
          </nz-form-item>

          <div class="mt-8 mb-4">
             <h3 class="text-lg font-bold text-gray-800 border-b pb-2">Poll Options</h3>
          </div>

          <div formArrayName="options" class="space-y-4">
            <div *ngFor="let option of options.controls; let i = index" [formGroupName]="i" class="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group transition-all hover:shadow-md">
              
              <button 
                *ngIf="options.length > 2"
                type="button" 
                class="absolute -right-3 -top-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer z-10"
                (click)="removeOption(i)"
              >
                <span nz-icon nzType="close" nzTheme="outline"></span>
              </button>

              <nz-form-item class="mb-3">
                <nz-form-control nzErrorTip="Option title is required!">
                  <nz-input-group nzSize="large">
                    <input type="text" nz-input formControlName="title" placeholder="Option {{ i + 1 }}" class="rounded-md" />
                  </nz-input-group>
                </nz-form-control>
              </nz-form-item>
              
              <nz-form-item class="mb-0">
                <nz-form-control>
                  <input type="text" nz-input formControlName="description" placeholder="Short description (optional)" class="border-transparent bg-transparent hover:bg-white focus:bg-white hover:border-gray-300 focus:border-indigo-300 text-sm py-1 rounded transition-colors" />
                </nz-form-control>
              </nz-form-item>
              
            </div>
          </div>

          <div class="mt-6 flex justify-center">
             <button 
                type="button" 
                nz-button 
                nzType="dashed" 
                class="w-full max-w-sm rounded-lg border-indigo-300 text-indigo-600 hover:text-indigo-700 hover:border-indigo-500 hover:bg-indigo-50 transition-colors h-12 text-base font-medium flex justify-center items-center gap-2" 
                (click)="addOption()"
                [disabled]="options.length >= 10"
              >
              <span nz-icon nzType="plus"></span>
              Add another option
            </button>
          </div>

          <div class="mt-12 pt-6 border-t border-gray-100">
             <button 
                nz-button 
                nzType="primary" 
                nzSize="large" 
                class="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-none shadow-md hover:shadow-lg transition-all" 
                [nzLoading]="isSubmitting"
             >
               Launch Poll
             </button>
          </div>

        </form>
      </nz-card>
    </div>
  `
})
export class CreatePollComponent {
  private fb = inject(FormBuilder);
  private pollService = inject(PollService);
  private message = inject(NzMessageService);
  private router = inject(Router);

  isSubmitting = false;

  pollForm: FormGroup = this.fb.group({
    title: [null, [Validators.required, Validators.maxLength(200)]],
    description: [null, [Validators.maxLength(1000)]],
    options: this.fb.array([], [Validators.minLength(2)])
  });

  get options(): FormArray {
    return this.pollForm.get('options') as FormArray;
  }

  constructor() {
    // Start with 2 empty options by default
    this.addOption();
    this.addOption();
  }

  createOptionFormGroup(): FormGroup {
    return this.fb.group({
      title: [null, [Validators.required, Validators.maxLength(100)]],
      description: [null, [Validators.maxLength(250)]]
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
      this.isSubmitting = true;
      const request: CreatePollRequest = this.pollForm.value;
      
      this.pollService.createPoll(request).subscribe({
        next: () => {
          this.message.success('Poll created successfully!');
          this.isSubmitting = false;
          this.router.navigate(['/']); // redirect to list
        },
        error: (err) => {
          this.message.error('Failed to create poll. Please try again.');
          console.error(err);
          this.isSubmitting = false;
        }
      });
    } else {
      Object.values(this.pollForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      // Do the same for options array
      this.options.controls.forEach(group => {
        Object.values((group as FormGroup).controls).forEach(control => {
          if (control.invalid) {
             control.markAsDirty();
             control.updateValueAndValidity({ onlySelf: true });
          }
        });
      });
    }
  }
}
