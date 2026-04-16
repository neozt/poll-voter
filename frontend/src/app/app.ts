import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NzLayoutModule],
  template: `
    <nz-layout class="min-h-screen bg-gray-50">
      <nz-content>
        <router-outlet></router-outlet>
      </nz-content>
    </nz-layout>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class App {}
