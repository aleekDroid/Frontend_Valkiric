import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        
        <div class="footer-col brand-col">
          <a routerLink="/" class="footer-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,28 16,22 2,28" fill="#C0392B"/>
              <polygon points="16,22 2,28 16,28 30,28" fill="#A93226" opacity="0.6"/>
            </svg>
            <span>VALKIRIC</span>
          </a>
          <p class="footer-tagline">Forjado para los que no se rinden.</p>

        </div>

        <div class="footer-col links-col">
          <div class="links-group">
            <h4>Tienda</h4>
            <a routerLink="/catalog" [queryParams]="{category:'supplements'}">Suplementos</a>
            <a routerLink="/catalog" [queryParams]="{category:'clothing'}">Ropa</a>
            <a routerLink="/catalog" [queryParams]="{category:'accessories'}">Accesorios</a>
          </div>
          <div class="links-group">
            <h4>Cuenta y Legal</h4>
            <a routerLink="/login">Iniciar Sesión</a>
            <a routerLink="/profile">Perfil</a>
            <a routerLink="/terms">Términos y Condiciones</a>
            <a routerLink="/contact">Página de Contacto</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <span>© {{ year }} Valkiric. Todos los derechos reservados.</span>
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
      display: grid;
      grid-template-columns: 1.2fr 1fr 1.2fr;
      gap: 40px;
      padding: 48px 24px;
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 900;
      color: var(--color-text);
      margin-bottom: 12px;
      text-decoration: none;
    }
    .footer-tagline {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 24px;
    }
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 300px;
      
      h4 { font-size: 0.9rem; color: var(--color-text); margin-bottom: 4px; }
      input, textarea {
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        padding: 8px 12px;
        color: var(--color-text);
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.85rem;
      }
      button {
        background: var(--color-primary);
        color: white;
        border: none;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: opacity 0.2s;
        &:hover { opacity: 0.9; }
      }
    }
    .links-col {
      display: flex;
      gap: 40px;
    }
    .links-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      h4 {
        font-size: 0.8rem;
        text-transform: uppercase;
        color: var(--color-text-muted);
        margin-bottom: 4px;
      }
      a {
        font-size: 0.875rem;
        color: var(--color-text-muted);
        text-decoration: none;
        &:hover { color: var(--color-primary); }
      }
    }
    .map-col {
      h4 {
        font-size: 0.9rem;
        color: var(--color-text);
        margin-bottom: 8px;
      }
      .address-text {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin-bottom: 12px;
      }
    }
    .footer-bottom {
      border-top: 1px solid var(--color-border);
      padding: 16px 0;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      text-align: center;
    }
    @media (max-width: 900px) {
      .footer-inner { grid-template-columns: 1fr; }
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();

  onSubmitContact(event: Event): void {
    event.preventDefault();
    alert('Mensaje enviado. Nos pondremos en contacto contigo pronto.');
    const form = event.target as HTMLFormElement;
    form.reset();
  }
}