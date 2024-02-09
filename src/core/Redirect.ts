import { ofElement, askEventBus, run } from "./component";
import { RouterEvents } from "./router";
import { pipe } from "./util";

export const Redirect = (url: string) =>
  pipe(
    ofElement("div"),
    askEventBus<RouterEvents>(),
    run((_, __, context) => {
      context.eventBus.notify("BROWSE_TO", { url });
    })
  );
