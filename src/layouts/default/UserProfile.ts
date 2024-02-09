import { ofElement, ask, run } from "src/core/component";
import { EventBus } from "src/core/eventbus";
import { pipe } from "src/core/util";
import { Events } from "src/events";

export const UserProfile = pipe(
  ofElement("div", (ev) => (ev.textContent = "Hej Guest")),
  ask<{ eventBus: EventBus<Events> }>(),
  run((app, _, context) => {
    const bus = context.eventBus.register(app.node);
    bus("LOGIN", (ev) => {
      app.node.textContent = `Hej ${ev.detail.name}`;
    });
  })
);
