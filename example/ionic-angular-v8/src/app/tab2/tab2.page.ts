import { Component } from '@angular/core';
import * as Sentry from '@sentry/capacitor';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {
  constructor() {}

  public captureSimpleMessage(): void {
    Sentry.captureMessage(`${Date.now()}: Captured message on button click.`);
  }

  public captureBreadcrumbMessage(): void {
    Sentry.addBreadcrumb({ message: 'message with breadcrumbs' });
    Sentry.captureMessage(
      `${Date.now()}: Captured message with added breadcrumbs.`,
    );
  }

  public captureTagMessage(): void {
    Sentry.setTag('testTag', 'test-tag-value');
    Sentry.captureMessage(
      `${Date.now()}: Captured message with custom tag.`,
    );
  }

  public captureContextMessage(): void {
    Sentry.setContext("game character", {
      name: "Johnny Tester",
      affiliation: "The Good Side",
      special_bonus: "Can summon anything at any time."
    });
    Sentry.captureMessage(
      `${Date.now()}: Captured message with added context.`,
    );
  }

  public captureLog(): void {
    Sentry.logger.info('hello world capacitor');
    Sentry.logger.warn('hello world capacitor');
    Sentry.logger.error('hello world capacitor');
    Sentry.logger.fatal('hello world capacitor', {
      customAttribute: 1234,
      complexAttribute: { logged: true}
    });
  }

  public close(): void {
    Sentry.close();
  }
}
