import { Component } from '@angular/core';

import * as Sentry from '@sentry/capacitor';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  constructor() {}

  public captureSimpleMessage(): void {
    Sentry.captureMessage(`${Date.now()}: Captured messaged on button click.`);
  }

  public captureBreadcrumbMessage(): void {
    Sentry.addBreadcrumb({ message: 'message with breadcrumbs' });
    Sentry.captureMessage(
      `${Date.now()}: Captured messaged with breadcrumbs on button click.`,
    );
  }

  public captureTagMessage(): void {
    Sentry.setTag('testTag', 'test-tag-value');
    Sentry.captureMessage(
      `${Date.now()}: Captured messaged with tag on button click.`,
    );
  }

  public captureContextMessage(): void {
    Sentry.setContext("game character", {
      name: "Johnny Tester",
      affiliation: "The Good Side",
      special_bonus: "Can summon anything at any time."
    });
    Sentry.captureMessage(
      `${Date.now()}: Captured messaged added context.`,
    );
  }
}
