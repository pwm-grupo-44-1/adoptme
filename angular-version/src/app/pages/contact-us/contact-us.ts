import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data';
import { ContactReason } from '../../models/data';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css'
})
export class ContactUs implements OnInit {
  title = '';
  reasons: ContactReason[] = [];
  mapUrl = '';
  contactInfo: string[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getContactUs().subscribe(data => {
      this.title = data.title;
      this.reasons = data.reasons;
      this.mapUrl = data.mapUrl;
      this.contactInfo = data.info;
    });
  }
}
