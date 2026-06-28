import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  onSubmit(event: Event): void {
    event.preventDefault();
    alert('Mensaje enviado. El equipo de Valkiric se pondrá en contacto pronto.');
    const form = event.target as HTMLFormElement;
    form.reset();
  }
}