import { Redirect } from "./core/Redirect";
import {
  GetRequiredContext,
  ask,
  askEventBus,
  mount,
  ofElement,
  run,
  setChildren,
} from "./core/component";
import { mkEventbus } from "./core/eventbus";
import {
  addRoute,
  ___route,
  TopLevelRouter,
  installHistoryRouting,
} from "./core/router";
import { pipe } from "./core/util";
import { Events } from "./events";
import { DefaultLayout } from "./layouts/default";
import { LoginLayout } from "./layouts/login";
import { Login } from "./modules/Login";
import { Todos } from "./modules/Todos";
import { Wizard } from "./modules/Wizard";

const routes = () =>
  pipe(
    ___route([new RegExp("^/todos"), Todos()]),
    addRoute([new RegExp("^/wizard"), Wizard()]),
    addRoute([new RegExp(".*"), Redirect("/todos/")])
  );

const AuthAwareRouter = pipe(
  ofElement("div"),
  ask<GetRequiredContext<ReturnType<typeof DefaultLayout>>>(),
  ask<GetRequiredContext<ReturnType<typeof TopLevelRouter>>>(),
  askEventBus<Events>(),
  run((a, _, context) => {
    const listen = context.eventBus.register(a.node);
    const mySetChildren = setChildren(a, context);

    installHistoryRouting(context.eventBus, listen);

    listen(
      "LOGOUT",
      () => {
        mySetChildren([LoginLayout(Login)], "topLevelRouter");
      },
      { wasAuthenticated: false }
    );

    listen("LOGIN", () => {
      mySetChildren(
        [DefaultLayout(TopLevelRouter(routes()))],
        "topLevelRouter"
      );
    });
  })
);

mount(
  document.getElementById("app")!,
  AuthAwareRouter({
    mkElement: document.createElement.bind(document),
    url: window.location.pathname,
    eventBus: mkEventbus<Events>(),
  })
);
