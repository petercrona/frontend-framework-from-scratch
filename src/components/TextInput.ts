import { ofElement, run } from "../core/component";
import { pipe } from "../core/util";

export const TextInput = (
  required: boolean,
  autocomplete: HTMLInputElement["autocomplete"]
) =>
  pipe(
    ofElement("input", (e) => {
      e.type = "text";
      e.required = required;
      e.autocomplete = autocomplete;
    }),
    run((app) => Promise.resolve({
      name: "TextInput",
      clear: () => {
        app.node.value = "";
      },
      getValue: () => {
        return app.node.value;
      },
    }))
  );
