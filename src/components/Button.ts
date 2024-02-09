import { ofElement, run } from "../core/component";
import { pipe } from "../core/util";

export const Button = (text: string, type?: HTMLButtonElement["type"]) =>
  pipe(
    ofElement("button", (e) => {
      e.textContent = text;
      if (type) {
        e.type = type;
      }
    }),
    run(({ node }) =>
      Promise.resolve({
        name: "Button",
        onClick: (fn: EventListener) => {
          node.addEventListener("click", fn);
        },
      })
    )
  );
