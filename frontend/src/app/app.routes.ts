import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home/home').then((m) => m.Home),
    title: 'KB0TLL | Jefferson County Amateur Radio Club',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/pages/about/about').then((m) => m.About),
    title: 'About | KB0TLL',
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./features/calendar/pages/calendar/calendar').then(
        (m) => m.Calendar
      ),
    title: 'Calendar | KB0TLL',
  },
  {
    path: 'recap',
    loadComponent: () =>
      import('./features/recap/pages/recap/recap').then((m) => m.Recap),
    title: 'Recap | KB0TLL',
  },
  {
    path: 'leadership',
    loadComponent: () =>
      import('./features/leadership/pages/leadership/leadership').then(
        (m) => m.Leadership
      ),
    title: 'Leadership | KB0TLL',
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./features/gallery/pages/gallery/gallery').then(
        (m) => m.Gallery
      ),
    title: 'Photo Gallery | KB0TLL',
  },
  {
    path: 'member-photos',
    loadComponent: () =>
      import('./features/member-photos/pages/member-photos/member-photos').then(
        (m) => m.MemberPhotos
      ),
    title: 'Member Photos | KB0TLL',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
