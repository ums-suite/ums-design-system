import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  UmsAvatarComponent,
  UmsAvatarGroupComponent,
  UmsBadgeComponent,
  UmsBreadcrumbsComponent,
  UmsCardComponent,
  UmsTimelineComponent,
  type AvatarGroupMember,
  type BreadcrumbItem,
  type TimelineEntry,
} from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target for the DSYS-11 data-display family (Card, Badge,
 * Avatar, Avatar group, Breadcrumbs, Timeline). Includes a long-form Bengali variant on the
 * profile Card and a Badge label (design-decisions.md "Locale-Safe Component Sizing
 * Verification").
 */
@Component({
  selector: 'app-data-display-catalog',
  standalone: true,
  imports: [
    UmsCardComponent,
    UmsBadgeComponent,
    UmsAvatarComponent,
    UmsAvatarGroupComponent,
    UmsBreadcrumbsComponent,
    UmsTimelineComponent,
  ],
  templateUrl: './data-display-catalog.component.html',
  styleUrl: './data-display-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataDisplayCatalogComponent {
  protected readonly breadcrumbItems: readonly BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Students', href: '/students' },
    { label: 'Fahim Rahman' },
  ];

  protected readonly groupMembers: readonly AvatarGroupMember[] = [
    { name: 'Fahim Rahman' },
    { name: 'Nusrat Jahan' },
    { name: 'Tanvir Ahmed' },
    { name: 'Kamrul Islam' },
    { name: 'Sadia Akter' },
  ];

  protected readonly timelineEntries: readonly TimelineEntry[] = [
    { title: 'Application submitted', timestamp: '4 Jan 2026', status: 'info' },
    {
      title: 'Documents verified',
      timestamp: '6 Jan 2026',
      status: 'success',
      description: 'Verified by the Admissions Office.',
    },
    {
      title: 'Awaiting seat confirmation',
      timestamp: '9 Jan 2026',
      status: 'warning',
      description: 'Pending payment of the admission fee.',
    },
  ];

  /** A representative long-form Bengali label, exercising Badge/Card layout overflow. */
  protected readonly bengaliBadgeLabel = 'ভর্তি নিশ্চিতকরণের অপেক্ষায়';
  protected readonly bengaliProfileName = 'ড. ফারাহ হোসেন, রেজিস্ট্রার';
}
