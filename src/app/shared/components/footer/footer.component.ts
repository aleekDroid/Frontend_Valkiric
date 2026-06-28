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

          <form class="contact-form" (submit)="onSubmitContact($event)">
            <h4>Contacto</h4>
            <input type="text" placeholder="Nombre" required>
            <input type="email" placeholder="Correo electrónico" required>
            <textarea placeholder="Mensaje" rows="2" required></textarea>
            <button type="submit">Enviar Mensaje</button>
          </form>
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
          </div>
        </div>

        <div class="footer-col map-col">
          <h4>Nuestra Ubicación</h4>
          <p class="address-text">Av. Principal 123, Zona Centro, Querétaro, Qro.</p>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119066.41730219198!2d-100.47952458428629!3d20.61214040925232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d35b8fdc5b6ac3%3A0x9cd1092ed5634163!2sSantiago%20de%20Quer%C3%A9taro%2C%20Qro.!5e0!3m2!1ses!2smx!4v1700000000000!5m2!1ses!2smx" 
            width="100%" height="200" style="border:0; border-radius: 8px;" 
            allowfullscreen="" loading="lazy">
          </iframe>
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