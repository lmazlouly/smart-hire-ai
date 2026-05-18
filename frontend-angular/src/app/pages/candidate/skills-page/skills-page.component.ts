import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

@Component({
  selector: 'app-skills-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills-page.component.html'
})
export class SkillsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  skillForm: FormGroup;
  isAddingSkill = false;

  skills: Skill[] = [
    { name: 'JavaScript', level: 'expert', category: 'Programming' },
    { name: 'TypeScript', level: 'advanced', category: 'Programming' },
    { name: 'Angular', level: 'advanced', category: 'Framework' },
    { name: 'React', level: 'intermediate', category: 'Framework' },
    { name: 'Node.js', level: 'intermediate', category: 'Backend' },
    { name: 'Python', level: 'beginner', category: 'Programming' },
    { name: 'SQL', level: 'intermediate', category: 'Database' },
    { name: 'Docker', level: 'beginner', category: 'DevOps' }
  ];

  categories = ['Programming', 'Framework', 'Backend', 'Database', 'DevOps', 'Design'];
  levels = ['beginner', 'intermediate', 'advanced', 'expert'];

  recommendedSkills = [
    { name: 'Kubernetes', reason: 'High demand in cloud-native applications' },
    { name: 'GraphQL', reason: 'Growing popularity in API development' },
    { name: 'AWS', reason: 'Leading cloud platform with many job opportunities' },
    { name: 'MongoDB', reason: 'Popular NoSQL database for modern apps' }
  ];

  constructor() {
    this.skillForm = this.fb.group({
      name: [''],
      level: ['intermediate'],
      category: ['Programming']
    });
  }

  addSkill(): void {
    if (this.skillForm.invalid || !this.skillForm.value.name.trim()) {
      return;
    }

    const newSkill: Skill = {
      name: this.skillForm.value.name.trim(),
      level: this.skillForm.value.level,
      category: this.skillForm.value.category
    };

    // Check if skill already exists
    if (!this.skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      this.skills.push(newSkill);
      this.skillForm.reset({ level: 'intermediate', category: 'Programming' });
    }
  }

  removeSkill(skillName: string): void {
    this.skills = this.skills.filter(s => s.name !== skillName);
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'expert':
        return 'bg-[#10B981]/10 text-[#10B981]';
      case 'advanced':
        return 'bg-[#6366F1]/10 text-[#6366F1]';
      case 'intermediate':
        return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'beginner':
        return 'bg-[#606078]/10 text-[#606078]';
      default:
        return 'bg-[#EBEBF0] text-[#606078]';
    }
  }

  getSkillsByCategory(): { [key: string]: Skill[] } {
    const grouped: { [key: string]: Skill[] } = {};
    this.skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  }

  getSkillPercentage(level: string): number {
    if (!this.skills || this.skills.length === 0) return 0;
    const count = this.skills.filter(s => s.level === level).length;
    return (count / this.skills.length) * 100;
  }

  goBack(): void {
    this.router.navigate(['/candidate']);
  }
}
