import { ofElement, css, addChild } from "../../../core/component";
import { pipe } from "../../../core/util";

export const Header = pipe(
  ofElement("header"),
  addChild(ofElement("h1", (e) => (e.textContent = "Todos"))),
  css({
    h1: {
      "font-size": "4rem",
      margin: "0",
      "line-height": "0.71",
    },
  })
);
