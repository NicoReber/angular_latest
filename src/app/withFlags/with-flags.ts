import { signalStoreFeature, withMethods, withState } from '@ngrx/signals';

type Flag = {
  name: string;
  description: string;
};

type LoadingState<T extends readonly Flag[]> = {
  [K in T[number]['name'] as `${K}_Loading`]: boolean;
};

type BaseLoadingState = {
  loading: boolean;
  activeFlags: Flag[];
};

function createLoadingState<const T extends readonly Flag[]>(
  flags: T
): LoadingState<T> & BaseLoadingState {
  const state: BaseLoadingState = {
    loading: false,
    activeFlags: [],
  };

  const loadingState: any = {};
  flags.forEach((flag) => {
    loadingState[`${flag.name}_Loading`] = false;
  });

  return { ...state, ...loadingState };
}
const x = createLoadingState([
  { name: 'featureA', description: 'Feature A' },
  { name: 'featureB', description: 'Feature B' },
] as const);

export function withFlags<const T extends readonly Flag[]>(flags: T) {
  const state = createLoadingState(flags);
  state.activeFlags;

  return signalStoreFeature(
    withState(state),
    withMethods((store) => {
      // 'store' statt 'state' für Klarheit
      return {
        log() {
          console.log('Current State:', store.activeFlags());
        },
      };
    })
  );
}
