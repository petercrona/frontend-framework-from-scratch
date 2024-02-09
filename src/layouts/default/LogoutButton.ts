import { Button } from "../../components/Button";
import { askEventBus, run } from "../../core/component";
import { pipe } from "../../core/util";
import { Events } from "../../events";

export const LogoutButton = () => pipe(
  Button("Log Out", "button"),
  askEventBus<Events>(),
  run((a, _, context) => {
    a.controllers.Button.get(a.node)?.self.onClick(() => {
      context.eventBus.notify("LOGOUT", { wasAuthenticated: true });
    });
  })
);
