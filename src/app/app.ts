import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeatureFlags } from './featureFlagStore/feature-flag.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  store = inject(FeatureFlags);
  protected readonly title = signal('angular_latest');
  constructor() {
    this.store.log();
  }
}
