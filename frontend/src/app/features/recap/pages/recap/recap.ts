import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBold,
  lucideEdit3,
  lucideHeading2,
  lucideItalic,
  lucideLink,
  lucideList,
  lucidePlus,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';

type RecapTag = 'meeting' | 'net' | 'event';

type RecapLink = {
  label: string;
  url: string;
};

type RecapPost = {
  id: number;
  title: string;
  summary: string;
  body: string;
  tags: RecapTag[];
  links: RecapLink[];
  published_date: string;
  created_at: string;
  updated_at: string;
};

type RecapPostForm = {
  id: number | null;
  title: string;
  summary: string;
  body: string;
  tags: RecapTag[];
  links: RecapLink[];
  published_date: string;
};

@Component({
  selector: 'app-recap',
  imports: [FormsModule, NgIcon],
  providers: [
    provideIcons({
      lucideBold,
      lucideEdit3,
      lucideHeading2,
      lucideItalic,
      lucideLink,
      lucideList,
      lucidePlus,
      lucideTrash2,
      lucideX,
    }),
  ],
  templateUrl: './recap.html',
  styleUrl: './recap.scss',
})
export class Recap implements OnInit {
  @ViewChild('readerPanel') private readerPanel?: ElementRef<HTMLElement>;

  private readonly http = inject(HttpClient);
  private readonly recapPostsUrl = '/api/recap-posts';
  private readonly adminTokenStorageKey = 'kb0tll-calendar-admin-token';

  protected readonly posts = signal<RecapPost[]>([]);
  protected readonly selectedPostId = signal<number | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly recapError = signal<string | null>(null);
  protected readonly adminError = signal<string | null>(null);
  protected readonly adminToken = signal('');
  protected readonly showAdminLogin = signal(false);
  protected readonly showEditor = signal(false);

  protected adminTokenInput = '';

  protected readonly tagOptions: { value: RecapTag; label: string }[] = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'net', label: 'Net' },
    { value: 'event', label: 'Event' },
  ];

  protected editor: RecapPostForm = this.createEmptyEditor();

  protected readonly isAdmin = computed(() => this.adminToken().length > 0);

  protected readonly selectedPost = computed(() => {
    const posts = this.posts();

    return posts.find((post) => post.id === this.selectedPostId()) ?? posts[0] ?? null;
  });

  ngOnInit(): void {
    this.loadAdminToken();
    this.loadPosts();
  }

  protected selectPost(postId: number): void {
    this.selectedPostId.set(postId);
    this.scrollReaderIntoViewOnMobile();
  }

  protected formatDate(dateKey: string): string {
    const date = new Date(`${dateKey}T00:00:00`);

    return date.toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  protected tagLabel(tag: RecapTag): string {
    return this.tagOptions.find((option) => option.value === tag)?.label ?? tag;
  }

  protected tagClasses(tag: RecapTag): string {
    switch (tag) {
      case 'meeting':
        return 'recap-tag recap-tag-meeting';
      case 'net':
        return 'recap-tag recap-tag-net';
      case 'event':
        return 'recap-tag recap-tag-event';
    }
  }

  protected renderBody(body: string): string {
    const lines = body.split(/\r?\n/);
    const html: string[] = [];
    let listItems: string[] = [];
    let paragraphLines: string[] = [];

    const closeList = () => {
      if (listItems.length === 0) {
        return;
      }

      html.push(`<ul>${listItems.join('')}</ul>`);
      listItems = [];
    };

    const closeParagraph = () => {
      if (paragraphLines.length === 0) {
        return;
      }

      html.push(`<p>${paragraphLines.map((line) => this.renderInline(line)).join('<br>')}</p>`);
      paragraphLines = [];
    };

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        closeParagraph();
        closeList();
        continue;
      }

      if (trimmedLine.startsWith('## ')) {
        closeParagraph();
        closeList();
        html.push(`<h3>${this.renderInline(trimmedLine.slice(3))}</h3>`);
        continue;
      }

      if (trimmedLine.startsWith('- ')) {
        closeParagraph();
        listItems.push(`<li>${this.renderInline(trimmedLine.slice(2))}</li>`);
        continue;
      }

      closeList();
      paragraphLines.push(trimmedLine);
    }

    closeParagraph();
    closeList();

    return html.join('');
  }

  protected toggleAdminLogin(): void {
    this.showAdminLogin.update((show) => !show);
    this.adminError.set(null);
  }

  protected unlockAdmin(): void {
    const token = this.adminTokenInput.trim();

    if (!token) {
      this.adminError.set('Enter the admin token.');
      return;
    }

    this.adminToken.set(token);
    localStorage.setItem(this.adminTokenStorageKey, token);
    this.adminTokenInput = '';
    this.adminError.set(null);
    this.showAdminLogin.set(false);
  }

  protected signOutAdmin(): void {
    this.adminToken.set('');
    this.adminTokenInput = '';
    localStorage.removeItem(this.adminTokenStorageKey);
    this.showEditor.set(false);
  }

  protected openCreateEditor(): void {
    this.editor = this.createEmptyEditor();
    this.showEditor.set(true);
    this.adminError.set(null);
  }

  protected openEditEditor(post: RecapPost): void {
    this.editor = {
      id: post.id,
      title: post.title,
      summary: post.summary,
      body: post.body,
      tags: [...post.tags],
      links: post.links.map((link) => ({ ...link })),
      published_date: post.published_date,
    };
    this.showEditor.set(true);
    this.adminError.set(null);
  }

  protected closeEditor(): void {
    this.showEditor.set(false);
    this.adminError.set(null);
  }

  protected toggleTag(tag: RecapTag): void {
    if (this.editor.tags.includes(tag)) {
      this.editor.tags = this.editor.tags.filter((existingTag) => existingTag !== tag);
      return;
    }

    this.editor.tags = [...this.editor.tags, tag];
  }

  protected hasTag(tag: RecapTag): boolean {
    return this.editor.tags.includes(tag);
  }

  protected addLink(): void {
    this.editor.links = [...this.editor.links, { label: '', url: '' }];
  }

  protected removeLink(index: number): void {
    this.editor.links = this.editor.links.filter((_, linkIndex) => linkIndex !== index);
  }

  protected insertFormat(before: string, after: string, textarea: HTMLTextAreaElement): void {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.editor.body.slice(start, end) || 'text';

    this.editor.body = [
      this.editor.body.slice(0, start),
      before,
      selectedText,
      after,
      this.editor.body.slice(end),
    ].join('');

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    });
  }

  protected insertList(textarea: HTMLTextAreaElement): void {
    this.insertFormat('- ', '', textarea);
  }

  protected insertLink(textarea: HTMLTextAreaElement): void {
    this.insertFormat('[', '](https://)', textarea);
  }

  protected savePost(): void {
    const payload = this.sanitizeEditor();

    if (!payload.title || !payload.body) {
      this.adminError.set('Title and body are required.');
      return;
    }

    const request = this.editor.id
      ? this.http.put<RecapPost>(`${this.recapPostsUrl}/${this.editor.id}`, payload, {
          headers: this.getAdminHeaders(),
        })
      : this.http.post<RecapPost>(this.recapPostsUrl, payload, {
          headers: this.getAdminHeaders(),
        });

    request.subscribe({
      next: (savedPost) => {
        this.posts.update((posts) => {
          const existingIndex = posts.findIndex((post) => post.id === savedPost.id);
          const nextPosts =
            existingIndex >= 0
              ? posts.map((post) => (post.id === savedPost.id ? savedPost : post))
              : [savedPost, ...posts];

          return this.sortPosts(nextPosts);
        });
        this.selectedPostId.set(savedPost.id);
        this.showEditor.set(false);
        this.adminError.set(null);
        this.recapError.set(null);
      },
      error: () => {
        this.adminError.set('Could not save the post. Check your admin token and try again.');
      },
    });
  }

  protected deletePost(post: RecapPost): void {
    this.http.delete(`${this.recapPostsUrl}/${post.id}`, {
      headers: this.getAdminHeaders(),
    }).subscribe({
      next: () => {
        this.posts.update((posts) => posts.filter((existingPost) => existingPost.id !== post.id));
        this.selectedPostId.set(this.posts()[0]?.id ?? null);
        this.showEditor.set(false);
      },
      error: () => {
        this.adminError.set('Could not remove the post. Check your admin token and try again.');
      },
    });
  }

  private loadPosts(): void {
    this.isLoading.set(true);

    this.http.get<RecapPost[]>(this.recapPostsUrl).subscribe({
      next: (posts) => {
        this.posts.set(this.sortPosts(posts));
        this.selectedPostId.set(posts[0]?.id ?? null);
        this.recapError.set(null);
        this.isLoading.set(false);
      },
      error: () => {
        this.recapError.set('Could not load recap posts.');
        this.isLoading.set(false);
      },
    });
  }

  private loadAdminToken(): void {
    const token = localStorage.getItem(this.adminTokenStorageKey);

    if (token) {
      this.adminToken.set(token);
    }
  }

  private createEmptyEditor(): RecapPostForm {
    return {
      id: null,
      title: '',
      summary: '',
      body: '',
      tags: [],
      links: [],
      published_date: this.toDateKey(new Date()),
    };
  }

  private sanitizeEditor(): Omit<RecapPostForm, 'id'> {
    return {
      title: this.editor.title.trim(),
      summary: this.editor.summary.trim(),
      body: this.editor.body.trim(),
      tags: this.editor.tags,
      links: this.editor.links
        .map((link) => ({
          label: link.label.trim(),
          url: link.url.trim(),
        }))
        .filter((link) => link.label && link.url),
      published_date: this.editor.published_date,
    };
  }

  private renderInline(text: string): string {
    return this.escapeHtml(text)
      .replace(/\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private sortPosts(posts: RecapPost[]): RecapPost[] {
    return [...posts].sort((a, b) => {
      const dateCompare = b.published_date.localeCompare(a.published_date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return b.id - a.id;
    });
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getAdminHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Admin-Token': this.adminToken(),
    });
  }

  private scrollReaderIntoViewOnMobile(): void {
    if (!window.matchMedia('(max-width: 860px)').matches) {
      return;
    }

    window.setTimeout(() => {
      this.readerPanel?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
}
