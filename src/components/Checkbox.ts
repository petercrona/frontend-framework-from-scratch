import { ofElement, run } from "../core/component";
import { pipe } from "../core/util";

export const Checkbox = () =>
  pipe(
    ofElement("input", (e) => (e.type = "checkbox")),
    run((app) => Promise.resolve({
      name: "Checkbox",
      isChecked: () => {
        return app.node.checked;
      },
    }))
  );
