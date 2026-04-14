import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recruiter',
  imports: [CommonModule],
  templateUrl: './recruiter.component.html',
  styleUrl: './recruiter.component.css'
})
export class RecruiterComponent {
  candidates = [
    { name: 'Ahmed', score: 85 },
    { name: 'Kon', score: 45 },
  ];

}
