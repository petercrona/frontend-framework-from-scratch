import { Component, addChild, css, ofElement } from "../../core/component";
import { pipe } from "../../core/util";

export const LoginLayout = <C extends Component>(main: C) => {
  return pipe(
    ofElement("div"),
    addChild(pipe(ofElement("main"), addChild(main))),
    css({
      ":host": {
        display: "grid",
        "grid-template": "1fr / 1fr",
        background: "#46abd7",
        height: "100vh",
        "place-items": "center",
      },

      main: {
        width: "320px",
        padding: "20px",
        "box-sizing": "border-box",
        background: "#cf1b1a",
        animation: "rotate 0.5s linear",
      },
    }),
    css(`
    @keyframes rotate {
      0% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
      75% { transform: rotate(-3deg); }
      100% { transform: rotate(0deg); }
    }
    `)
  );
};
