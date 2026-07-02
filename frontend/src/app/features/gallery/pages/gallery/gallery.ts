import { Component, HostListener, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideX } from '@ng-icons/lucide';

type GalleryPhoto = {
  src: string;
  alt: string;
};

type GallerySection = {
  title: string;
  photos: GalleryPhoto[];
};

type GallerySectionDefinition = {
  title: string;
  filePrefix: string;
  count: number;
  extension?: string;
};

const photoGalleryRoot = 'images/photo_gallery';

const numberedPhotos = (
  sectionTitle: string,
  filePrefix: string,
  count: number,
  extension = 'jpg',
): GalleryPhoto[] =>
  Array.from({ length: count }, (_, index) => ({
    src: `${photoGalleryRoot}/${filePrefix}_${index + 1}.${extension}`,
    alt: `${sectionTitle} photo ${index + 1}`,
  }));

const gallerySectionDefinitions: GallerySectionDefinition[] = [
  {
    title: 'Twin City Days Booth 2025',
    filePrefix: 'twin_city_days_2025',
    count: 5,
  },
  {
    title: 'General, Recent Photos',
    filePrefix: 'recent_general',
    count: 2,
    extension: 'jpeg',
  },
  {
    title: 'Installation - 442.425 UHF Repeater Antenna',
    filePrefix: 'uhf_install',
    count: 8,
    extension: 'jpeg',
  },
  {
    title: 'Christmas Party, December 7, 2024',
    filePrefix: 'christmas_party_2024',
    count: 1,
  },
];

const buildGallerySections = (): GallerySection[] =>
  gallerySectionDefinitions.map(({ title, filePrefix, count, extension }) => ({
    title,
    photos: numberedPhotos(title, filePrefix, count, extension ?? 'jpg'),
  }));

@Component({
  selector: 'app-gallery',
  imports: [NgIcon],
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight, lucideX })],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  protected readonly gallerySections: GallerySection[] = buildGallerySections();

  protected readonly selectedPhoto = signal<GalleryPhoto | null>(null);
  protected readonly selectedSectionIndex = signal<number | null>(null);
  protected readonly selectedPhotoIndex = signal<number | null>(null);

  protected openPhoto(sectionIndex: number, photoIndex: number): void {
    this.selectedSectionIndex.set(sectionIndex);
    this.selectedPhotoIndex.set(photoIndex);
    this.selectedPhoto.set(this.gallerySections[sectionIndex].photos[photoIndex]);
  }

  protected closePhoto(): void {
    this.selectedSectionIndex.set(null);
    this.selectedPhotoIndex.set(null);
    this.selectedPhoto.set(null);
  }

  protected showPreviousPhoto(event: MouseEvent): void {
    event.stopPropagation();

    this.showPhotoAtOffset(-1);
  }

  protected showNextPhoto(event: MouseEvent): void {
    event.stopPropagation();

    this.showPhotoAtOffset(1);
  }

  private selectPhoto(sectionIndex: number, photoIndex: number): void {
    const photo = this.gallerySections[sectionIndex].photos[photoIndex];

    this.selectedSectionIndex.set(sectionIndex);
    this.selectedPhotoIndex.set(photoIndex);
    this.selectedPhoto.set(photo);
  }

  @HostListener('document:keydown', ['$event'])
  protected handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.selectedPhoto()) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.showPhotoAtOffset(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.showPhotoAtOffset(1);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closePhoto();
    }
  }

  private showPhotoAtOffset(offset: number): void {
    const currentSectionIndex = this.selectedSectionIndex();
    const currentIndex = this.selectedPhotoIndex();

    if (currentSectionIndex === null || currentIndex === null) {
      return;
    }

    const sectionPhotos = this.gallerySections[currentSectionIndex].photos;
    const nextIndex =
      (currentIndex + offset + sectionPhotos.length) % sectionPhotos.length;

    this.selectPhoto(currentSectionIndex, nextIndex);
  }
}
