import { Link } from "../../components/Link";
import { askEventBus, run } from "../..//core/component";
import { pipe } from "../..//core/util";
import { Events } from "../../events";

export const Hello = () =>
  pipe(
    Link("world", "Go to World"),
    askEventBus<Events>(),
    run(({ node }, __, context) => {
      context.eventBus.register(node)("LOGIN", (ev) => {
        node.textContent = `${ev.detail.name}, go to World?`;
      });
    })
  );
