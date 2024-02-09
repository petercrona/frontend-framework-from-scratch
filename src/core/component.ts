import { StandardPropertiesHyphen } from "csstype";
import { EventBus } from "./eventbus";
import { convertToCSS, pipe, id } from "./util";

export type App<
  NodeType = HTMLElement,
  Controllers = {},
  InternalControllers = {}
> = {
  node: NodeType;
  shadow: ShadowRoot | null;
  controllers: Controllers;
  internalControllers: InternalControllers;
};

export type Component<
  NodeType = HTMLElement,
  ProvidedContext = {},
  Context extends ProvidedContext = ProvidedContext,
  Controllers = {},
  InternalControllers = {}
> = (
  context: Omit<Context, keyof ProvidedContext>
) => Promise<App<NodeType, Controllers, InternalControllers>>;

export type GetController<T extends (...args: any) => any> =
  ReturnType<T> extends Component<any, any, any, infer Controllers, any>
    ? Controllers
    : never;

export type GetContext<T> = T extends Component<
  any,
  any,
  infer Context,
  any,
  any
>
  ? Context
  : never;

export type GetRequiredContext<T> = T extends Component<
  any,
  infer ProvidedContext,
  infer Context,
  any,
  any
>
  ? Omit<Context, keyof ProvidedContext>
  : never;

type Rename<T, OldKey extends string, NewKey extends string> = {
  [K in keyof T as K extends OldKey ? NewKey : K]: T[K];
};

type RenameWeakMapObj<W, NewName extends string> = W extends WeakMap<
  infer K,
  infer V
>
  ? V extends { self: any }
    ? WeakMap<K, Rename<V, "self", NewName>>
    : never
  : never;

type CSSObject = {
  [selector: string]: StandardPropertiesHyphen;
};

type BaseContext = {
  mkElement: Document["createElement"];
};

// == Constructors

const of = <NodeType>(node: NodeType): Component<NodeType, {}, {}, {}> =>
  ofApp({
    node: node,
    shadow: null,
    controllers: {},
    internalControllers: {},
  });

const ofApp =
  <A, B, C extends B, D, E>(app: App<A, D, E>): Component<A, B, C, D, E> =>
  () =>
    Promise.resolve(app);

export const ofElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  modify: (e: HTMLElementTagNameMap[K], context: BaseContext) => void = id
): Component<HTMLElementTagNameMap[K], {}, BaseContext, {}, {}> => {
  return (context) => {
    const elem = context.mkElement(tag);
    modify(elem, context);
    return of(elem)(context);
  };
};

// == Modifiers

export const ask =
  <Context>() =>
  <A, B, C extends B, D, E>(
    c: Component<A, B, C, D, E>
  ): Component<A, B, C & Context, D, E> =>
    id(c);

type AddEvents<T, B> = T extends { eventBus: EventBus<any> }
  ? {
      [K in keyof T]: K extends "eventBus"
        ? EventBus<T[K] extends EventBus<infer A> ? A & B : never>
        : T[K];
    }
  : T & { eventBus: EventBus<B> };

export const askEventBus =
  <Events>() =>
  <A>(
    c: A
  ): A extends Component<infer A, infer B, infer Context, infer D, infer E>
    ? AddEvents<Context, Events> extends B
      ? Component<A, B, AddEvents<Context, Events>, D, E>
      : never
    : never =>
    id(c) as any;

export const tell =
  <Key extends string, V>(binding: [Key, V]) =>
  <A, B, C extends B & Record<Key, V>, D, E>(
    c: Component<A, B, C, D, E>
  ): Component<A, B & Record<Key, V>, C, D, E> =>
  (context) =>
    c({ ...context, [binding[0]]: binding[1] } as C);

export const tellController =
  <InternalController>() =>
  <A, B, C extends B, D, E>(
    c: Component<A, B, C, D, E>
  ): Component<A, B, C, D, E & InternalController> =>
    id(c) as any;

export const map =
  <
    NodeType extends Node,
    NodeTypeB extends Node,
    Controllers extends Record<string, WeakMap<Node, unknown>>,
    Context extends ProvidedContext,
    InternalControllers,
    ProvidedContext
  >(
    mapFn: (
      c: App<NodeType, Controllers, InternalControllers>,
      context: ProvidedContext & Context
    ) => App<NodeTypeB, Controllers, InternalControllers>
  ) =>
  (
    c: Component<
      NodeType,
      ProvidedContext,
      Context,
      Controllers,
      InternalControllers
    >
  ): Component<
    NodeTypeB,
    ProvidedContext,
    Context,
    Controllers,
    InternalControllers
  > => {
    return (context: Context) => {
      return c(context).then((x) => {
        const mapped = mapFn(x, context);
        Object.values(x.controllers).forEach((weakMap) => {
          weakMap.set(mapped.node, weakMap.get(x.node));
        });
        return mapped;
      });
    };
  };

type MergedWeakMap<A, B> = A extends WeakMap<Node, infer V1>
  ? B extends WeakMap<Node, infer V2>
    ? WeakMap<Node, V1 & V2>
    : never
  : never;

type MergedWeakMaps<A, B> = {
  [K in keyof A | keyof B]: K extends keyof A
    ? A[K] extends WeakMap<Node, infer V1>
      ? K extends keyof B
        ? B[K] extends WeakMap<Node, infer V2>
          ? WeakMap<Node, V1 & V2>
          : WeakMap<Node, V1>
        : WeakMap<Node, V1>
      : never
    : K extends keyof B
    ? B[K] extends WeakMap<Node, infer V2>
      ? WeakMap<Node, V2>
      : never
    : never;
};

interface RunInterface {
  <
    NodeType extends Node,
    Controllers extends {},
    ControllerName extends string,
    ControllerType extends Promise<{ name: ControllerName }>,
    ControllersB extends {
      [K in Awaited<ControllerType>["name"]]: WeakMap<
        Node,
        { self: Awaited<ControllerType> }
      >;
    },
    ProvidedContextA extends {},
    ContextA extends ProvidedContextA,
    C
  >(
    runFn: (
      res: App<NodeType, Controllers, C>,
      appUtil: AppUtil,
      context: ContextA
    ) => ControllerType
  ): (
    component: Component<NodeType, ProvidedContextA, ContextA, Controllers, C>
  ) => Component<
    NodeType,
    ProvidedContextA,
    ContextA,
    MergedWeakMaps<Controllers, ControllersB>,
    C
  >;
  <
    NodeType extends Node,
    Controllers extends {},
    ProvidedContextA extends {},
    ContextA extends ProvidedContextA,
    C
  >(
    runFn: (
      res: App<NodeType, Controllers, C>,
      appUtil: AppUtil,
      context: ContextA
    ) => Promise<void> | void
  ): (
    component: Component<NodeType, ProvidedContextA, ContextA, Controllers, C>
  ) => Component<NodeType, ProvidedContextA, ContextA, Controllers, C>;
}

type AppUtil = {
  getController: <A>(
    controllers: WeakMap<Node, A>,
    id: string
  ) => A | undefined;
  getNode: (id: string) => HTMLElement | undefined;
};

export const run: RunInterface = (runFn) => {
  return (component) => {
    return (context) => {
      return component(context).then((res) => {
        const appUtil = {
          getNode: getNode(res),
          getController: getController(res),
        };

        return (runFn(res, appUtil, context) || Promise.resolve()).then(
          (newControllers) => {
            const ctrl = newControllers
              ? {
                  [newControllers.name]: new WeakMap([
                    [res.node, { self: newControllers }],
                  ]),
                }
              : {};

            return {
              ...res,
              controllers: {
                ...res.controllers,
                ...ctrl,
              },
            };
          }
        );
      });
    };
  };
};

type WeakMapValue<T extends WeakMap<any, any>> = T extends WeakMap<any, infer V>
  ? V
  : never;

interface iExport {
  <
    A extends HTMLElement,
    B,
    C extends B,
    Controllers,
    InternalControllers,
    NewControllerType extends keyof InternalControllers,
    NewController extends WeakMap<Node, { self: { name: NewControllerType } }>,
    NewControllerName extends string
  >(
    exports: (
      controllers: InternalControllers
    ) => [string, NewController, NewControllerName]
  ): (c: Component<A, B, C, Controllers, InternalControllers>) => Component<
    A,
    B,
    C,
    MergedWeakMaps<
      Controllers,
      {
        [K in WeakMapValue<NewController>["self"]["name"]]: MergedWeakMap<
          NewControllerType extends keyof Controllers
            ? Controllers[NewControllerType]
            : WeakMap<Node, {}>,
          RenameWeakMapObj<
            InternalControllers[WeakMapValue<NewController>["self"]["name"]],
            NewControllerName
          >
        >;
      }
    >,
    InternalControllers
  >;
}

export const exportController: iExport = (exports) => {
  return (component) => {
    return (context) => {
      return component(context).then((r) => {
        const [nodeId, controllers, exportName] = exports(
          r.internalControllers
        );
        const controller = getController(r)(controllers, nodeId)!;

        const baseWeakmap: WeakMap<Node, unknown> =
          r.controllers[controller.self.name as string] || new WeakMap();

        const transformedController = { [exportName]: controller.self };

        if (baseWeakmap.has(r.node)) {
          const obj = baseWeakmap.get(r.node) as object;
          baseWeakmap.set(r.node, { ...obj, ...transformedController });
        } else {
          baseWeakmap.set(r.node, transformedController);
        }
        const newControllers = {
          ...r.controllers,
          ...{
            [controller.self.name]: baseWeakmap,
          },
        };
        return { ...r, controllers: newControllers } as any;
      });
    };
  };
};

export const addChild =
  <
    NodeTypeChild extends HTMLElement,
    ControllersB extends {},
    ProvidedContextB,
    ContextB extends ProvidedContextB,
    InternalControllersB extends {}
  >(
    child: Component<
      NodeTypeChild,
      ProvidedContextB,
      ContextB,
      ControllersB,
      InternalControllersB
    >,
    id?: string
  ) =>
  <
    NodeTypeParent extends HTMLElement,
    ControllersA extends {},
    InternalControllersA extends {},
    ProvidedContextA,
    ContextA extends ProvidedContextA
  >(
    component: Component<
      NodeTypeParent,
      ProvidedContextA,
      ContextA,
      ControllersA,
      InternalControllersA
    >
  ): Component<
    NodeTypeParent,
    ProvidedContextA & ProvidedContextB,
    ContextA & ContextB,
    ControllersA,
    MergedWeakMaps<InternalControllersA, ControllersB>
  > => {
    return (context) => {
      return Promise.all([
        component(context as ContextA),
        child(context as ContextB),
      ]).then(
        ([
          {
            node: a,
            shadow,
            controllers: controllersA,
            internalControllers: internalControllersA,
          },
          {
            node: b,
            controllers: controllersB,
            internalControllers: internalControllersB,
          },
        ]) => {
          if (id) {
            b.id = id;
          }
          (shadow || a).append(b);
          return {
            node: a,
            shadow,
            controllers: controllersA,
            internalControllers: mergeControllers(
              internalControllersA,
              controllersB,
              b
            ),
          };
        }
      );
    };
  };

const mergeControllers = <A, B extends {}>(a: A, b: B, nodeB: HTMLElement) => {
  Object.keys(b).forEach((k) => {
    const controller = b[k].get(nodeB);
    a[k] = (a[k] || new WeakMap()).set(nodeB, controller);
  });

  return a as MergedWeakMaps<A, B>;
};

interface wrapDiv {
  <
    NodeType extends Node,
    Controllers extends Record<string, WeakMap<Node, unknown>>,
    A,
    B extends { mkElement: Document["createElement"] } & A,
    C
  >(
    c: Component<NodeType, A, B, Controllers, C>
  ): Component<HTMLDivElement, A, B, Controllers, C>;
}

export const wrapDiv: wrapDiv = map((app, context) => {
  const containingElement = context.mkElement("div");
  containingElement.append(app.node);
  return { ...app, node: containingElement };
});

export const css = <
  ProvidedContext extends {},
  Context extends ProvidedContext,
  Controllers extends Record<string, WeakMap<Node, unknown>>,
  A
>(
  css: CSSObject | string
): ((
  c: Component<HTMLElement, ProvidedContext, Context, Controllers, A>
) => Component<HTMLElement, ProvidedContext, Context, Controllers, A>) =>
  map((app) => {
    const shadow = app.shadow ?? app.node.attachShadow({ mode: "closed" });
    const sheet = new CSSStyleSheet();
    if (typeof css === "string") {
      if (sheet.replace) {
        // for JSDOM
        sheet.replace(css);
      }
    } else {
      if (sheet.replace) {
        // for JSDOM
        sheet.replace(convertToCSS(css));
      }
    }

    if (shadow.adoptedStyleSheets) {
      // JSDOM
      shadow.adoptedStyleSheets.push(sheet);
    }

    Array.from(app.node.childNodes).forEach((element) => {
      shadow.append(element);
    });
    return { ...app, shadow };
  });

// == Effects

export const setChildren =
  <
    ControllersParent extends {},
    NodeTypeParent extends HTMLElement,
    NodeTypeChild extends HTMLElement,
    ProvidedContext extends {},
    Context extends ProvidedContext,
    InternalControllersParent extends {}
  >(
    app: App<NodeTypeParent, ControllersParent, InternalControllersParent>,
    context: Context,
    operation: "REPLACE" | "APPEND" = "REPLACE"
  ) =>
  <Controllers extends {}, InternalControllerChild extends {}>(
    components: Component<
      NodeTypeChild,
      ProvidedContext,
      Context,
      Controllers,
      InternalControllerChild
    >[],
    id: string
  ) => {
    if (operation === "REPLACE") {
      Array.from(app.node.childNodes).forEach((e) => e.remove());
    }
    const withChildren = components.reduce(
      (res, child) => addChild(child, id)(res) as Component,
      ofApp(app)
    );

    return withChildren(context);
  };

// Util

export const mount = (el: HTMLElement, appPromise: Promise<App>) => {
  return appPromise.then((app) => el.replaceWith(app.node));
};

export const getNode =
  <A extends HTMLElement, B, Elem extends HTMLElement, C>(app: App<A, B, C>) =>
  (id: string): Elem | undefined => {
    const container: ShadowRoot | HTMLElement = app.shadow || app.node;
    return container.querySelector(`#${id}`) as Elem;
  };

describe("getNode", () => {
  const context = { mkElement: document.createElement.bind(document) };

  test("returns existing node", () => {
    pipe(
      ofElement("div"),
      addChild(ofElement("p"), "childId"),
      run((_, appUtil) => {
        expect(appUtil.getNode("childId")).toBeTruthy();
      })
    )(context);
  });

  test("returns undefined if no node", () => {
    pipe(
      ofElement("div"),
      addChild(ofElement("p"), "childId"),
      run((_, appUtil) => {
        expect(appUtil.getNode("foobar")).toBeFalsy();
      })
    )(context);
  });

  test("returns node in shadow DOM", () => {
    pipe(
      ofElement("div"),
      map((a) => {
        const shadow = a.node.attachShadow({ mode: "closed" });
        return { ...a, shadow: shadow };
      }),
      addChild(ofElement("p"), "childId"),
      run((_, appUtil) => {
        expect(appUtil.getNode("childId")).toBeTruthy();
      })
    )(context).then((a) => {
      expect(a.shadow?.firstElementChild?.tagName).toBe("P");
    });
  });
});

const getController =
  <A extends HTMLElement, B, C>(app: App<A, B, C>) =>
  <E>(controllers: WeakMap<Node, E>, id: string): E | undefined => {
    return controllers.get(getNode(app)(id)!);
  };

export const getControllerForTest =
  <A extends HTMLElement, B, C>(app: App<A, B, C>) =>
  <E>(controllers: WeakMap<Node, E>, id: string): E | undefined => {
    return controllers.get(getNode(app)(id)!);
  };

describe("getController", () => {
  const context = { mkElement: document.createElement.bind(document) };
  const ChildWithController = (fn: () => void) =>
    pipe(
      ofElement("p"),
      run(() => Promise.resolve({ name: "Foo", sayHi: fn }))
    );

  test("returns controller of existing node", () => {
    const fn = jest.fn();
    pipe(
      ofElement("div"),
      addChild(ChildWithController(fn), "childId"),
      run((a, appUtil) => {
        appUtil
          .getController(a.internalControllers.Foo, "childId")
          ?.self.sayHi();
        expect(fn).toHaveBeenCalledTimes(1);
      })
    )(context);
  });

  test("returns undefined if no node", () => {
    pipe(
      ofElement("div"),
      addChild(
        ChildWithController(() => null),
        "childId"
      ),
      run((a, appUtil) => {
        expect(
          appUtil.getController(a.internalControllers.Foo, "foobar")
        ).toBeFalsy();
      })
    )(context);
  });

  test("returns undefined if no controller", () => {
    pipe(
      ofElement("div"),
      addChild(
        ChildWithController(() => null),
        "childId"
      ),
      addChild(ofElement("div"), "noControllerId"),
      run((a, appUtil) => {
        expect(
          appUtil.getController(a.internalControllers.Foo, "noControllerId")
        ).toBeFalsy();
      })
    )(context);
  });

  test("returns controller in shadow DOM", () => {
    const fn = jest.fn();
    pipe(
      ofElement("div"),
      map((a) => {
        const shadow = a.node.attachShadow({ mode: "closed" });
        return { ...a, shadow: shadow };
      }),
      addChild(ChildWithController(fn), "childId"),
      run((a, appUtil) => {
        appUtil
          .getController(a.internalControllers.Foo, "childId")
          ?.self.sayHi();
        expect(fn).toHaveBeenCalledTimes(1);
      })
    )(context).then((a) => {
      expect(a.shadow?.firstElementChild?.tagName).toBe("P");
    });
  });
});
