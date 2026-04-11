import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <a routerLink="/" class="footer-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,28 16,22 2,28" fill="#C0392B"/>
              <polygon points="16,22 2,28 16,28 30,28" fill="#A93226" opacity="0.6"/>
            </svg>
            <span>VALKIRIC</span>
          </a>
          <p class="footer-tagline">Forjado para los que no se rinden.</p>
        </div>

        <div class="footer-links">
          <div class="footer-col">
            <h4>Tienda</h4>
            <a routerLink="/catalog" [queryParams]="{category:'supplements'}">Suplementos</a>
            <a routerLink="/catalog" [queryParams]="{category:'clothing'}">Ropa</a>
            <a routerLink="/catalog" [queryParams]="{category:'accessories'}">Accesorios</a>
            <a routerLink="/catalog" [queryParams]="{category:'merch'}">Merch</a>
          </div>
          <div class="footer-col">
            <h4>Recursos</h4>
            <a href="https://musclewiki.com" target="_blank" rel="noopener">MuscleWiki</a>
            <a href="https://www.healthline.com/nutrition" target="_blank" rel="noopener">Healthline Nutrition</a>
            <a href="https://exrx.net" target="_blank" rel="noopener">ExRx.net</a>
          </div>
          <div class="footer-col">
            <h4>Cuenta</h4>
            <a routerLink="/login">Iniciar Sesión</a>
            <a routerLink="/register">Registro</a>
            <a routerLink="/profile">Perfil</a>
            <a routerLink="/cart">Carrito</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <span>© {{ year }} Valkiric. Todos los derechos reservados.</span>
          <span class="footer-divider">·</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      margin-top: 80px;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
    }

    .footer-inner {
      display: flex;
      gap: 60px;
      padding: 48px 24px;
      flex-wrap: wrap;
    }

    .footer-brand {
      flex: 0 0 220px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 900;
      letter-spacing: 0.15em;
      color: var(--color-text);
      margin-bottom: 12px;
    }

    .footer-tagline {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      font-style: italic;
    }

    .footer-links {
      display: flex;
      gap: 48px;
      flex: 1;
      flex-wrap: wrap;
    }

    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 120px;

      h4 {
        font-family: var(--font-display);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        margin-bottom: 4px;
      }

      a {
        font-size: 0.875rem;
        color: var(--color-text-muted);
        transition: color var(--transition);
        &:hover { color: var(--color-primary); }
      }
    }

    .footer-bottom {
      border-top: 1px solid var(--color-border);
      padding: 16px 0;
      font-size: 0.8rem;
      color: var(--color-text-muted);

      .container {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .footer-divider { opacity: 0.4; }

    @media (max-width: 768px) {
      .footer-inner { flex-direction: column; gap: 32px; }
      .footer-brand { flex: none; }
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
