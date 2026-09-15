import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  UmsAppShellComponent,
  UmsStepperComponent,
  UmsTabBarComponent,
  type AppShellNavItem,
  type StepperStep,
  type TabBarItem,
} from '@ums/design-system';

/**
 * DSYS-18 visual-regression / a11y target for the DSYS-13 navigation family (App shell in both
 * operational and public modes, Tab bar, Stepper). Includes a long-form Bengali label variant on
 * the Stepper (design-decisions.md "Locale-Safe Component Sizing Verification").
 */
@Component({
  selector: 'app-navigation-catalog',
  standalone: true,
  imports: [UmsAppShellComponent, UmsTabBarComponent, UmsStepperComponent],
  templateUrl: './navigation-catalog.component.html',
  styleUrl: './navigation-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationCatalogComponent {
  protected readonly operationalNavItems: readonly AppShellNavItem[] = [
    { label: 'Dashboard', icon: 'grid-four', href: '/dashboard', active: true },
    { label: 'Students', icon: 'student', href: '/students' },
    { label: 'Admissions', icon: 'clipboard-text', href: '/admissions' },
  ];

  protected readonly publicNavItems: readonly AppShellNavItem[] = [
    { label: 'About', href: '/about' },
    {
      label: 'Admissions',
      children: [
        { label: 'Undergraduate', href: '/admissions/undergraduate' },
        { label: 'Graduate', href: '/admissions/graduate' },
      ],
    },
    { label: 'Contact', href: '/contact' },
  ];

  protected readonly tabItems: readonly TabBarItem[] = [
    { label: 'Overview' },
    { label: 'Documents' },
    { label: 'Payments', disabled: true },
  ];
  protected readonly selectedTabIndex = signal(0);

  protected readonly wizardSteps: readonly StepperStep[] = [
    { label: 'Personal details' },
    { label: 'Academic history' },
    { label: 'Payment' },
    { label: 'Review' },
  ];
  protected readonly currentStepIndex = signal(1);

  protected readonly bengaliWizardSteps: readonly StepperStep[] = [
    { label: 'শিক্ষার্থীর ব্যক্তিগত তথ্য' },
    { label: 'শিক্ষাগত পূর্ববৃত্তান্ত যাচাই' },
    { label: 'ভর্তি ফি পরিশোধ' },
  ];
}
