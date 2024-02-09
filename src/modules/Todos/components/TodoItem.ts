import { Button } from "../../../components/Button";
import { Checkbox } from "../../../components/Checkbox";
import {
  ofElement,
  addChild,
  exportController,
  run,
  ask,
} from "../../../core/component";
import { EventBus } from "../../../core/eventbus";
import { mkId, pipe } from "../../../core/util";
import { Events } from "../../../events";

const checkboxId = mkId(),
  removeId = mkId();

export const TodoItem = (value: string) => {
  let checkboxIdLocal = mkId();

  return pipe(
    ofElement("li"),
    addChild(
      pipe(
        ofElement("label"),
        addChild(Checkbox(), checkboxIdLocal),
        addChild(ofElement("span", (e) => (e.textContent = value))),
        exportController((cs) => [checkboxIdLocal, cs.Checkbox, "Checkbox"])
      ),
      checkboxId
    ),
    addChild(Button("Remove"), removeId),
    ask<{ eventBus: EventBus<Events> }>(),
    run((app, { getNode, getController }) => {
      getNode(removeId)!.addEventListener("click", () => {
        app.node.remove();
      });

      return Promise.resolve({
        name: "TodoItem",
        getValue: () => value,
        isChecked: getController(app.internalControllers.Checkbox, checkboxId)
          ?.Checkbox.isChecked!,
        remove: app.node.remove,
      });
    })
  );
};
