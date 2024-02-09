import { Component, addChild, css, ofElement } from "src/core/component";
import { pipe } from "src/core/util";
import { Menu } from "./Menu";

export const DefaultLayout = <C extends Component>(main: C) => {
  return pipe(
    ofElement("div"),
    addChild(Menu),
    addChild(pipe(ofElement("main"), addChild(main))),
    css({
      ":host": {
        display: "grid",
        "grid-template-columns": "150px 1fr",
        gap: "20px",
      },
      main: {
        "max-width": "600px",
        "padding": "40px 0",
      },
    }),
    css(`
      @media (max-width: 800px) {
        :host {
          grid-template-columns: auto;
          min-height: auto;
        }
        main {
          padding: 10px;
        }
      }
    `)
  );
};
