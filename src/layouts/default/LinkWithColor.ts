import { Link } from "../../components/Link";
import { ask, run } from "../../core/component";
import { pipe, resetStyle } from "../../core/util";

export const LinkWithColor = (url: string, text: string) =>
  pipe(
    Link(url, text),
    ask<{ url: string }>(),
    run((a, _, context) => {
      const setColor = (newUrl: string) => {
        if (newUrl.startsWith(url.endsWith("/") ? url.slice(0, -1) : url)) {
          a.node.style.color = "#FFF";
          a.node.style.fontWeight = "bold";
        } else {
          resetStyle(a.node);
        }
      };

      context.eventBus.register(a.node)(
        "BROWSE_TO",
        (ev) => {
          setColor(ev.detail.url);
        },
        { url: context.url }
      );
    })
  );
