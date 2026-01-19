import { Component, inject, signal, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { signalStore, signalStoreFeature, withMethods, withState } from '@ngrx/signals';

type BaseState = {
  loading: boolean;
  items: string[];
};

type DynamicState<T extends readonly string[]> = {
  [K in T[number] as `${K}_enabled`]: boolean;
};

function createState<const T extends readonly string[]>(keys: T): BaseState & DynamicState<T> {
  const base: BaseState = { loading: false, items: [] };
  const dynamic: Record<string, boolean> = {};
  keys.forEach((key) => {
    dynamic[`${key}_enabled`] = false;
  });
  return { ...base, ...dynamic } as BaseState & DynamicState<T>;
}

export function withFeature<const T extends readonly string[]>(keys: T) {
  const state = createState(keys);

  return signalStoreFeature(
    withState(state),
    withMethods((store) => {
      return {
        log() {
          console.log(store.loading(), store.items());
        },
      };
    }),
  );
}

export function withFeatureFixed<const T extends readonly string[]>(keys: T) {
  const state = createState(keys);

  return signalStoreFeature(
    withState(state as BaseState),
    withMethods((store) => {
      return {
        log() {
          console.log(store.items());
          console.log(store.loading());
        },
      };
    }),
  );
}

const Store = signalStore(
  withFeature(['featureA', 'featureB'] as const),
  withMethods((store) => ({
    test() {
      store.loading();
      store.featureA_enabled();
    },
  })),
);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('angular_latest');
}
