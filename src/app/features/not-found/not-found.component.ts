import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf-page">
      <div class="nf-bg">
        <div class="nf-grid"></div>
      </div>
      <div class="nf-content">
        <svg class="nf-rune" width="80" height="80" viewBox="0 0 32 32" fill="none">
          <polygon points="16,2 30,28 16,22 2,28" fill="#C0392B" opacity="0.3"/>
          <polygon points="16,22 2,28 16,28 30,28" fill="#A93226" opacity="0.2"/>
        </svg>
        <h1 class="nf-code">404</h1>
        <h2 class="nf-title">Página No Encontrada</h2>
        <p class="nf-desc">
          El guerrero que buscas ha caído en batalla.<br>
          Esta ruta no existe en el reino de Valkiric.
        </p>
        <div class="nf-actions">
          <a routerLink="/" class="btn btn-primary btn-lg">← Volver al Inicio</a>
          <a routerLink="/catalog" class="btn btn-outline btn-lg">Ver Catálogo</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nf-page {
      min-height: calc(100vh - var(--header-h));
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .nf-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .nf-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(192,57,43,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(192,57,43,.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    .nf-content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 60px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      animation: fadeIn 0.5s ease;
    }

    .nf-rune {
      margin-bottom: 8px;
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }

    .nf-code {
      font-family: var(--font-display);
      font-size: clamp(5rem, 15vw, 10rem);
      font-weight: 900;
      letter-spacing: 0.1em;
      background: linear-gradient(135deg, #C0392B 0%, #2E2E2E 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: -12px;
    }

    .nf-title {
      font-family: var(--font-display);
      font-size: clamp(1.2rem, 3vw, 1.8rem);
      color: var(--color-text);
    }

    .nf-desc {
      color: var(--color-text-muted);
      line-height: 1.7;
      max-width: 400px;
      font-size: 0.95rem;
    }

    .nf-actions {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  `]
})
export class NotFoundComponent {}
