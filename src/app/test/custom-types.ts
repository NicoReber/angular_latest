// type NonRecord =
//   | Iterable<any>
//   | WeakSet<any>
//   | WeakMap<any, any>
//   | Promise<any>
//   | Date
//   | Error
//   | RegExp
//   | ArrayBuffer
//   | DataView
//   | Function;
// export type IsRecord<T> = T extends object ? (T extends NonRecord ? false : true) : false;
// export type IsUnknownRecord<T> = keyof T extends never
//   ? true
//   : string extends keyof T
//   ? true
//   : symbol extends keyof T
//   ? true
//   : number extends keyof T
//   ? true
//   : false;
// export type IsKnownRecord<T> = IsRecord<T> extends true
//   ? IsUnknownRecord<T> extends true
//     ? false
//     : true
//   : false;
// export type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {};
// export type DeepSignal<T> = Signal<T> &
//   (IsKnownRecord<T> extends true
//     ? Readonly<{
//         [K in keyof T]: IsKnownRecord<T[K]> extends true ? DeepSignal<T[K]> : Signal<T[K]>;
//       }>
//     : unknown);
// export type StateSignals<State> = IsKnownRecord<Prettify<State>> extends true
//   ? {
//       [Key in keyof State]: IsKnownRecord<State[Key]> extends true
//         ? DeepSignal<State[Key]>
//         : Signal<State[Key]>;
//     }
//   : {};
// export type WritableStateSource<State extends object> = {
//   [STATE_SOURCE]: {
//     [K in keyof State]: WritableSignal<State[K]>;
//   };
// };

// const result: LoadingState<typeof loadingFlags> = {
//   test1_Loading: false,
//   test2_Loading: false,
//   loading: false,
//   activeFlags: [],
// };

// const checkType1: IsKnownRecord<Prettify<LoadingState<Flag[]>>> extends true ? 'TRUE' : 'FALSE' =
//   'TRUE';
