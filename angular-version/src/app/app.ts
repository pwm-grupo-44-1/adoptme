import { Component } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header/header';
import { FooterComponent } from './pages/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'adoptme';
}
