import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-candidate',
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate.component.html',
  styleUrl: './candidate.component.css'
})
export class CandidateComponent {
  result: any = null;

  analyze() {
    this.result = {
      skills: 'Java, Spring Boot',
      score: 75
    };
  }
}
