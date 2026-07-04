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
  files: string[];
};

const photoGalleryRoot = '/images/photo_gallery';

const gallerySectionDefinitions: GallerySectionDefinition[] = [
  {
    title: 'Field Day 2026',
    files: [
      'field_day_2026_1.jpeg',
      'field_day_2026_2.jpeg',
    ],
  },
  {
    title: 'Twin City Days Booth 2025',
    files: [
      '004_twin_city_days_booth_2025_img_6780_scaled.jpg',
      '005_twin_city_days_booth_2025_imagejpeg_2.jpg',
      '006_twin_city_days_booth_2025_imagejpeg_1.jpg',
      '007_twin_city_days_booth_2025_img_0835.jpg',
      '008_twin_city_days_booth_2025_img_6778_scaled.jpg',
    ],
  },
  {
    title: 'General, Recent Photos',
    files: [
      '009_general_recent_photos_img_6647_scaled.jpeg',
      '010_general_recent_photos_2015_2016_board4.jpg',
    ],
  },
  {
    title: 'Installation - 442.425 UHF Repeater Antenna',
    files: [
      '011_installation_442425_uhf_repeater_antenna_bp_ak6ag.jpeg',
      '012_installation_442425_uhf_repeater_antenna_qutevceg.jpeg',
      '013_installation_442425_uhf_repeater_antenna_fdrf5ruq.jpeg',
      '014_installation_442425_uhf_repeater_antenna_pjtl6ziq.jpeg',
      '015_installation_442425_uhf_repeater_antenna_zbn7ufrg.jpeg',
      '016_installation_442425_uhf_repeater_antenna_ehaszvdg.jpeg',
      '017_installation_442425_uhf_repeater_antenna_wkwmwcxa.jpeg',
      '018_installation_442425_uhf_repeater_antenna_t5v97_yw.jpeg',
    ],
  },
  {
    title: 'Christmas Party, December 7, 2024',
    files: [
      '019_christmas_party_december_72024_img_0579_scaled.jpg',
      '020_christmas_party_december_72024_img_0569.jpg',
      '021_christmas_party_december_72024_img_0559_scaled.jpg',
      '022_christmas_party_december_72024_img_0576.jpg',
      '023_christmas_party_december_72024_img_0574.jpg',
      '024_christmas_party_december_72024_img_0572.jpg',
      '025_christmas_party_december_72024_img_0571.jpg',
      '026_christmas_party_december_72024_img_0570.jpg',
      '027_christmas_party_december_72024_img_0568.jpg',
      '028_christmas_party_december_72024_img_0567.jpg',
      '029_christmas_party_december_72024_img_0566.jpg',
      '030_christmas_party_december_72024_img_0564.jpg',
      '031_christmas_party_december_72024_img_0562.jpg',
      '032_christmas_party_december_72024_img_0560_scaled.jpg',
    ],
  },
  {
    title: 'Buck Knob Repeater Restore 2024-Gary KDØRIS, Owner',
    files: [
      '033_buck_knob_repeater_restore_2024_gary_kdøris_owner_1_1_2_scaled.jpg',
      '034_buck_knob_repeater_restore_2024_gary_kdøris_owner_3_1_scaled.jpg',
      '035_buck_knob_repeater_restore_2024_gary_kdøris_owner_2_1_scaled.jpg',
      '036_buck_knob_repeater_restore_2024_gary_kdøris_owner_4_1_1_scaled.jpg',
      '037_buck_knob_repeater_restore_2024_gary_kdøris_owner_6_1_1_scaled.jpg',
      '038_buck_knob_repeater_restore_2024_gary_kdøris_owner_10_1_1_scaled.jpg',
      '039_buck_knob_repeater_restore_2024_gary_kdøris_owner_7_1_1_scaled.jpg',
      '040_buck_knob_repeater_restore_2024_gary_kdøris_owner_13_1_1_scaled.jpg',
      '041_buck_knob_repeater_restore_2024_gary_kdøris_owner_12_1_1_scaled.jpg',
      '042_buck_knob_repeater_restore_2024_gary_kdøris_owner_9_1_1_scaled.jpg',
      '043_buck_knob_repeater_restore_2024_gary_kdøris_owner_8_1_1_scaled.jpg',
    ],
  },
  {
    title: 'Club Tower Raising 2024',
    files: [
      '044_club_tower_raising_2024_img_7198_1.jpg',
      '045_club_tower_raising_2024_dscf1122.jpg',
      '046_club_tower_raising_2024_dscf1125.jpg',
      '047_club_tower_raising_2024_dscf1123.jpg',
      '048_club_tower_raising_2024_img_0122.jpg',
      '049_club_tower_raising_2024_img_0120_scaled.jpg',
      '050_club_tower_raising_2024_img_0123.jpg',
      '051_club_tower_raising_2024_dscf1128.jpg',
      '052_club_tower_raising_2024_dscf1127.jpg',
      '053_club_tower_raising_2024_dscf1126.jpg',
      '054_club_tower_raising_2024_img_6862_1.jpg',
    ],
  },
  {
    title: 'Bottleneck Bridge Ride 2024',
    files: [
      '055_bottleneck_bridge_ride_2024_1000003158.jpg',
      '056_bottleneck_bridge_ride_2024_1000003170.jpg',
      '057_bottleneck_bridge_ride_2024_1000003161_1.jpg',
      '058_bottleneck_bridge_ride_2024_1.jpg',
      '059_bottleneck_bridge_ride_2024_img_0018.jpg',
      '060_bottleneck_bridge_ride_2024_1000003160.jpg',
      '061_bottleneck_bridge_ride_2024_4.jpg',
      '062_bottleneck_bridge_ride_2024_1000003173_scaled.jpg',
      '063_bottleneck_bridge_ride_2024_2.jpg',
    ],
  },
  {
    title: 'Twin City Days 2024',
    files: [
      '064_twin_city_days_2024_img_0139_scaled.jpg',
      '065_twin_city_days_2024_img_0136_scaled.jpg',
      '066_twin_city_days_2024_img_0131.jpg',
      '067_twin_city_days_2024_img_0132.jpg',
      '068_twin_city_days_2024_img_0129_scaled.jpg',
      '069_twin_city_days_2024_img_0128_scaled.jpg',
      '070_twin_city_days_2024_img_0127_scaled.jpg',
      '071_twin_city_days_2024_img_0125.jpg',
    ],
  },
  {
    title: 'Field Day 2024',
    files: [
      '072_field_day_2024_img_9839_scaled.jpg',
      '073_field_day_2024_img_9856.jpg',
      '074_field_day_2024_img_9854.jpg',
      '075_field_day_2024_img_9850.jpg',
      '076_field_day_2024_img_9848.jpg',
      '077_field_day_2024_img_9847.jpg',
      '078_field_day_2024_img_9844.jpg',
      '079_field_day_2024_img_9843.jpg',
      '080_field_day_2024_img_9846.jpg',
      '081_field_day_2024_img_9838.jpg',
      '082_field_day_2024_img_9837.jpg',
      '083_field_day_2024_img_9835.jpg',
      '084_field_day_2024_img_9834.jpg',
      '085_field_day_2024_img_9833.jpg',
      '086_field_day_2024_img_9824_scaled.jpg',
      '087_field_day_2024_alvaro_test.jpg',
    ],
  },
  {
    title: 'Assorted Club Photos',
    files: [
      '088_assorted_club_photos_img_6862_1_scaled.jpg',
      '089_assorted_club_photos_74015061184__aa476b7d_308f_446b_9c87_8f9feb7daa43.jpg',
      '090_assorted_club_photos_73984105692__a11406dd_5695_4c91_914d_9d218585ca58.jpg',
      '091_assorted_club_photos_74001717771__b0471501_91ea_461e_9c3f_e077e5247b46.jpg',
      '092_assorted_club_photos_img_9956.jpg',
      '093_assorted_club_photos_img_1367crop.jpeg',
      '094_assorted_club_photos_twin_city_days_2023.jpg',
      '095_assorted_club_photos_veb_1.jpg',
      '096_assorted_club_photos_adam_roof_crop_1.jpg',
      '097_assorted_club_photos_img_1369crop.jpeg',
      '098_assorted_club_photos_7_2_scaled.jpg',
      '099_assorted_club_photos_jan_8_2022_jcarc_banner.png',
      '100_assorted_club_photos_1crop.jpg',
      '101_assorted_club_photos_5.jpg',
      '102_assorted_club_photos_img_9280_1.jpg',
      '103_assorted_club_photos_img_6644.jpg',
      '104_assorted_club_photos_img_6638.jpg',
      '105_assorted_club_photos_img_6637.jpg',
      '106_assorted_club_photos_img_6635.jpg',
      '107_assorted_club_photos_img_6634.jpg',
      '108_assorted_club_photos_img_6632.jpg',
      '109_assorted_club_photos_img_6629.jpg',
      '110_assorted_club_photos_2crop.jpg',
      '111_assorted_club_photos_img_5960.jpg',
      '112_assorted_club_photos_attachment.jpg',
      '113_assorted_club_photos_img_9280.jpg',
      '114_assorted_club_photos_meeting_crop1_1.jpg',
      '115_assorted_club_photos_img_1368crop.jpeg',
      '116_assorted_club_photos_3crop.jpg',
      '117_assorted_club_photos_img_6631.jpg',
      '118_assorted_club_photos_img_6636.jpg',
      '119_assorted_club_photos_7.jpg',
      '120_assorted_club_photos_john_shooter.jpg',
      '121_assorted_club_photos_8.jpg',
      '122_assorted_club_photos_auction.jpg',
      '123_assorted_club_photos_beacon.jpg',
      '124_assorted_club_photos_club_station.jpg',
      '125_assorted_club_photos_fd1.jpg',
      '126_assorted_club_photos_fd2.jpg',
      '127_assorted_club_photos_fd3.jpg',
      '128_assorted_club_photos_fd4.jpg',
      '129_assorted_club_photos_field_day.jpg',
      '130_assorted_club_photos_sherwoods.jpg',
      '131_assorted_club_photos_tower.jpg',
      '132_assorted_club_photos_reach_out_riibbon_1_qkvc934pbeoan5h6nv4twgwn6hhgi9bvf8ozy4brvg.jpg',
    ],
  },
];

const buildGallerySections = (): GallerySection[] =>
  gallerySectionDefinitions.map(({ title, files }) => ({
    title,
    photos: files.map((file, index) => ({
      src: `${photoGalleryRoot}/${file}`,
      alt: `${title} photo ${index + 1}`,
    })),
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
