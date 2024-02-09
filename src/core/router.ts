import {
  Component,
  GetContext,
  ask,
  ofElement,
  run,
  setChildren,
  tell,
} from "./component";
import { EventBus } from "./eventbus";
import { pipe } from "./util";

export interface RouterEvents {
  BROWSE_TO: { url: string; preventHistoryUpdate?: boolean };
}

export const ___route = <A extends [RegExp, Component]>(route: A) => [route];

export const addRoute =
  <A1, B1, C1 extends B1, D1, E1>(
    routeA: [RegExp, Component<A1, B1, C1, D1, E1>]
  ) =>
  <A2, B2, C2 extends B2, D2, E2>(
    routeB: [RegExp, Component<A2, B2, C2, D2, E2>][]
  ) =>
    [...routeB, ...[routeA]] as [
      RegExp,
      Component<A1 & A2, B1 & B2, C1 & C2, D1 & D2, E1 & E2>
    ][];

export const findMatchingRoute = <
  A,
  ProvidedContext,
  Context extends ProvidedContext,
  D,
  E,
  C extends Component<A, ProvidedContext, Context, D, E>,
  R extends [RegExp, C][]
>(
  pathname: string,
  routes: R,
  alreadyMatched: string
): [string, Component] => {
  let pathnameWithSlash = pathname === "" ? "/" : pathname;
  for (let route of routes) {
    const [regexp, component] = route;
    const match = pathnameWithSlash.match(regexp);
    if (match) {
      let reminder = pathnameWithSlash.slice(match[0].length); // +1 bug here?
      if (reminder.startsWith("/") || reminder === "") {
        reminder = reminder === "" ? "/" : reminder;
        const componentWithReminder = pipe(
          component,
          ask<{ url: string; matchedUrlFull: string; matchedUrl: string }>(),
          tell(["url", reminder]),
          tell(["matchedUrlFull", alreadyMatched + match[0]]),
          tell(["matchedUrl", match[0]])
        );
        return [match[0], componentWithReminder as Component];
      }
    }
  }
  throw new Error("no route");
};

export const Router = <
  A,
  ProvidedSubContext,
  SubContext extends ProvidedSubContext,
  D,
  E,
  C extends Component<A, ProvidedSubContext, SubContext, D, E>,
  R extends [RegExp, C][]
>(
  routes: R
) => {
  return pipe(
    ofElement("div"),
    ask<{
      eventBus: EventBus<RouterEvents>;
      matchedUrl: string;
      matchedUrlFull: string;
      url: string;
    }>(),
    ask<GetContext<R[0][1]>>(),
    run((app, _, context) => {
      let prevMatchUrl: string = "";

      const handleNavigationChange = (goToUrl: string) => {
        const url = goToUrl.slice(context.matchedUrl.length);
        const [matchedUrl, component] = findMatchingRoute(
          url,
          routes,
          context.matchedUrl
        );
        if (matchedUrl !== prevMatchUrl) {
          prevMatchUrl = matchedUrl;
          return setChildren(app, context)([component], "route");
        }
        return Promise.resolve();
      };

      const listener = context.eventBus.register(app.node);
      listener(
        "BROWSE_TO",
        (ev) => {
          handleNavigationChange(ev.detail.url);
        },
        { url: `${context.matchedUrlFull}${context.url}` }
      );

      return Promise.resolve({
        name: "Router",
        listener: listener,
      });
    })
  );
};

export const TopLevelRouter = (routes: Parameters<typeof Router>[0]) =>
  pipe(Router(routes), tell(["matchedUrl", ""]), tell(["matchedUrlFull", ""]));

export const installHistoryRouting = (
  eventBus: EventBus<RouterEvents>,
  listener: ReturnType<EventBus<RouterEvents>["register"]>
) => {
  listener("BROWSE_TO", (ev) => {
    if (!ev.detail.preventHistoryUpdate) {
      if (window.location.pathname !== ev.detail.url) {
        history.pushState({}, "", ev.detail.url);
      }
    }
  });

  window.addEventListener("popstate", () => {
    eventBus.notify("BROWSE_TO", {
      url: window.location.pathname,
      preventHistoryUpdate: true,
    });
  });
};
