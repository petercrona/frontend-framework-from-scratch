import { addChild, css, ofElement } from "src/core/component";
import { Router, addRoute, ___route } from "src/core/router";
import { pipe } from "src/core/util";
import { cssVars } from "src/theme";
import { First } from "./First";
import { Hello } from "./Hello";
import { World } from "./World";

const routes = pipe(
  ___route([new RegExp("^/$"), First()]),
  addRoute([new RegExp("^/hello"), Hello()]),
  addRoute([new RegExp("^/world"), World()])
);

export const Wizard = () => pipe(
  ofElement("div"),
  addChild(Router(routes)),
  css({
    a: {
      color: cssVars.fg1,
    },
  })
);
