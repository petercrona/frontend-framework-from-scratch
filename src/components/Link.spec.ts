import { mkEventbus } from "../core/eventbus";
import { RouterEvents } from "../core/router";
import { Link } from "./Link";

describe("Link", () => {
  test("BROWSE_TO sent with getUrl output on click", () => {
    const eventBus = mkEventbus<RouterEvents>();
    Link(
      "/foobar",
      ""
    )({
      eventBus,
      matchedUrl: "",
      matchedUrlFull: "",
      mkElement: document.createElement.bind(document),
    }).then((a) => {
      const listen = eventBus.register(document.createElement("div"));
      listen("BROWSE_TO", (ev) => {
        expect(ev.detail.url).toBe("/foobar");
      });
      a.node.click();
    });
  });
});
