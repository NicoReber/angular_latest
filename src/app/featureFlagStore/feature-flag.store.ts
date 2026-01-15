import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { withFlags } from '../withFlags/with-flags';

const flags = [
  {
    name: 'newDashboard',
    description: 'Enable the new dashboard layout',
  },
  {
    name: 'betaFeatureX',
    description: 'Enable Beta Feature X for testing',
  },
] as const;

export const FeatureFlags = signalStore(
  { providedIn: 'root' },
  withFlags(flags),
  withMethods((store) => {
    return {
      log: () => {
        store.betaFeatureX_Loading();
        store.log();
      },
    };
  })
);
