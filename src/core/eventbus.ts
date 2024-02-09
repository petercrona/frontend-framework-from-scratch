export type EventBus<Events> = {
  register: (
    node: HTMLElement
  ) => <E extends keyof Events & string>(
    e: E,
    listener: (ev: CustomEvent<Events[E]>) => void,
    fallback?: Events[E]
  ) => () => void;
  notify: <E extends keyof Events & string>(
    event: E,
    payload: Events[E]
  ) => void;
};

export const mkEventbus = <Events>(): EventBus<Events> => {
  const observers: WeakRef<Node>[] = [];
  const lastEvent = {} as Events;

  const cleanup = () => {
    for (let i = observers.length - 1; i >= 0; i--) {
      if (!observers[i].deref()) {
        observers.splice(i, 1);
      }
    }
  };

  const listen =
    (node: HTMLElement) =>
    <E extends keyof Events & string>(
      event: E,
      listener: (ev: CustomEvent<Events[E]>) => void,
      fallback?: Events[E]
    ) => {
      node.addEventListener(event, listener);
      if (lastEvent[event]) {
        node.dispatchEvent(
          new CustomEvent(event, { detail: lastEvent[event] })
        );
      } else if (fallback) {
        node.dispatchEvent(new CustomEvent(event, { detail: fallback }));
      }
      return () => node.removeEventListener(event, listener);
    };
  const register = (node: HTMLElement) => {
    cleanup();
    observers.push(new WeakRef(node));
    return listen(node);
  };

  const notify = <E extends keyof Events & string>(
    event: E,
    payload: Events[E]
  ) => {
    lastEvent[event] = payload;
    observers.forEach((e) => {
      e.deref()?.dispatchEvent(new CustomEvent(event, { detail: payload }));
    });
    cleanup();
  };

  return { register, notify };
};
