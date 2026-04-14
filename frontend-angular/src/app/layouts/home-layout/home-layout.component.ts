import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './home-layout.component.html'
})
export class HomeLayoutComponent {
  mobileMenuOpen = false;
  activeNav = 'home';

  readonly navItems = [
    { href: '#features', label: 'Features' },
    { href: '#workflow', label: 'Workflow' },
    { href: '#impact', label: 'Impact' }
  ];

  readonly bottomNavItems = [
    { id: 'home', href: '#', label: 'Home' },
    { id: 'features', href: '#features', label: 'Features' },
    { id: 'workflow', href: '#workflow', label: 'Workflow' },
    { id: 'impact', href: '#impact', label: 'Impact' }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  setActiveNav(id: string): void {
    this.activeNav = id;
    this.closeMobileMenu();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const sections = ['impact', 'workflow', 'features'];
    const scrollY = window.scrollY + 120;
    let current = 'home';

    for (const id of sections) {
      const section = document.getElementById(id);

      if (section && scrollY >= section.offsetTop) {
        current = id;
        break;
      }
    }

    this.activeNav = current;
  }
}
