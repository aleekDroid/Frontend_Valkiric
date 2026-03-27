import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent],
  template: `
    <app-header />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-footer />
    <app-notification />
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - var(--header-h) - 260px);
    }
  `]
})
export class AppComponent {}
