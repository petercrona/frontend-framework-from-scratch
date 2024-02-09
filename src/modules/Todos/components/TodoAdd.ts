import { Button } from "../../../components/Button";
import { TextInput } from "../../../components/TextInput";
import { ofElement, addChild, wrapDiv, css, run } from "../../../core/component";
import { mkId, pipe } from "../../../core/util";
import { cssVars } from "../../../theme";

export const todoNameId = mkId();

export const TodoAdd = pipe(
  ofElement("form"),
  addChild(TextInput(true, "off"), todoNameId),
  addChild(Button("Add", "submit"), "submit"),
  wrapDiv,
  css({
    form: {
      display: "grid",
      "grid-template": "auto / 1fr auto",
      gap: cssVars.s1,
    },
    "input, button": {
      padding: cssVars.p2,
    },
  }),
  run(({ shadow, internalControllers }, { getController }) => {
    return Promise.resolve({
      name: "TodoAdd",
      onClick: (fn: (s: string) => void) => {
        shadow?.querySelector("form")!.addEventListener("submit", (ev) => {
          ev.preventDefault();
          fn(
            getController(
              internalControllers.TextInput,
              todoNameId
            )!.self.getValue()
          );
          getController(
            internalControllers.TextInput,
            todoNameId
          )!.self.clear();
        });
      },
    });
  })
);
