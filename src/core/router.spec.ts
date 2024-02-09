import { ofElement } from "./component";
import { mkEventbus } from "./eventbus";
import { Router, RouterEvents, ___route, addRoute } from "./router";
import { pipe } from "./util";

const context = (url: string) => ({
  eventBus: mkEventbus<RouterEvents>(),
  matchedUrl: "",
  matchedUrlFull: "",
  mkElement: document.createElement.bind(document),
  url,
});

describe("Router", () => {
  test("correct route is rendered", () => {
    const routes = pipe(
      ___route([new RegExp("^/routeA"), ofElement("strong")]),
      addRoute([new RegExp("^/routeB"), ofElement("em")])
    );

    Router(routes)(context("/routeA")).then((a) => {
      expect(a.node.firstElementChild?.tagName).toBe("STRONG");
    });

    Router(routes)(context("/routeB")).then((a) => {
      expect(a.node.firstElementChild?.tagName).toBe("EM");
    });
  });
});
