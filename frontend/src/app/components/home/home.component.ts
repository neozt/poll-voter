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
  imports: [CommonModule, FormsModule, NzButtonModule, NzInputModule, NzIconModule],
  providers: [NzMessageService],
  templateUrl: 'home.component.html',
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
