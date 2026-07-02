import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFacebook, lucideMenu, lucideYoutube } from '@ng-icons/lucide';

type NavItem = {
  label: string;
  path: string;
};

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [provideIcons({ lucideFacebook, lucideMenu, lucideYoutube })],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly menuOpen = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'About', path: '/about' },
    { label: 'Leadership', path: '/leadership' },
    { label: 'Photo Gallery', path: '/gallery' },
    { label: 'Member Photos', path: '/member-photos' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
