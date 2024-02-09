import { Properties } from "csstype";

type Fn<T, U> = (input: T) => U;

interface Pipe {
  (): never;
  <T>(value: T): T;
  <T, U>(value: T, fn1: Fn<T, U>): U;
  <T, U, V>(value: T, fn1: Fn<T, U>, fn2: Fn<U, V>): V;
  <T, U, V, W>(value: T, fn1: Fn<T, U>, fn2: Fn<U, V>, fn3: Fn<V, W>): W;
  <T, U, V, W, X>(
    value: T,
    fn1: Fn<T, U>,
    fn2: Fn<U, V>,
    fn3: Fn<V, W>,
    fn4: Fn<W, X>
  ): X;
  <T, U, V, W, X, Y>(
    value: T,
    fn1: Fn<T, U>,
    fn2: Fn<U, V>,
    fn3: Fn<V, W>,
    fn4: Fn<W, X>,
    fn5: Fn<X, Y>
  ): Y;
  <T, U, V, W, X, Y, Z>(
    value: T,
    fn1: Fn<T, U>,
    fn2: Fn<U, V>,
    fn3: Fn<V, W>,
    fn4: Fn<W, X>,
    fn5: Fn<X, Y>,
    fn6: Fn<Y, Z>
  ): Z;
  <T, U, V, W, X, Y, Z, A>(
    value: T,
    fn1: Fn<T, U>,
    fn2: Fn<U, V>,
    fn3: Fn<V, W>,
    fn4: Fn<W, X>,
    fn5: Fn<X, Y>,
    fn6: Fn<Y, Z>,
    fn7: Fn<Z, A>
  ): A;
  <T, U, V, W, X, Y, Z, A, B>(
    value: T,
    fn1: Fn<T, U>,
    fn2: Fn<U, V>,
    fn3: Fn<V, W>,
    fn4: Fn<W, X>,
    fn5: Fn<X, Y>,
    fn6: Fn<Y, Z>,
    fn7: Fn<Z, A>,
    fn8: Fn<A, B>
  ): B;
  <T, U, V, W, X, Y, Z, A, B, C>(
    value: T,
    fn1: Fn<T, U>,
    fn2: Fn<U, V>,
    fn3: Fn<V, W>,
    fn4: Fn<W, X>,
    fn5: Fn<X, Y>,
    fn6: Fn<Y, Z>,
    fn7: Fn<Z, A>,
    fn8: Fn<A, B>,
    fn9: Fn<B, C>
  ): C;
  <T, U, V, W, X, Y, Z, A, B, C, D>(
    value: T,
    fn1: Fn<T, U>,
    fn2: Fn<U, V>,
    fn3: Fn<V, W>,
    fn4: Fn<W, X>,
    fn5: Fn<X, Y>,
    fn6: Fn<Y, Z>,
    fn7: Fn<Z, A>,
    fn8: Fn<A, B>,
    fn9: Fn<B, C>,
    fn10: Fn<C, D>
  ): D;
}

export const pipe: Pipe = ((value: any, ...fns: Fn<any, any>[]) => {
  return fns.reduce((result, fn) => fn(result), value);
}) as Pipe;

export const id = <A>(x: A) => x;

export const mkId = () => `_${Math.random()}`.replace(".", "");

export const compact = <A>(array: (A | undefined | null)[]): A[] =>
  array.filter((item): item is A => item as boolean);

export const resetStyle = (node: HTMLElement) => {
  while (node.style.length > 0) {
    node.style.removeProperty(node.style[0]);
  }
};

export const convertToCSS = (obj: Properties) =>
  Object.entries(obj)
    .map(
      ([selector, styles]) =>
        `${selector}{${Object.entries(styles)
          .map(([prop, value]) => `${prop}:${value}`)
          .join(";")};}`
    )
    .join("\n");
