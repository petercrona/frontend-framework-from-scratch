import { ask, askEventBus, ofElement, run } from "../core/component";
import { RouterEvents } from "../core/router";
import { pipe } from "../core/util";

export const Link = (href: string, content: string) =>
  pipe(
    ofElement("a"),
    askEventBus<RouterEvents>(),
    ask<{
      matchedUrl: string;
      matchedUrlFull: string;
    }>(),
    run((app, _, context) => {
      app.node.textContent = content;
      app.node.href = getUrl(context, href);
      app.node.addEventListener("click", (e) => {
        e.preventDefault();
        context.eventBus.notify("BROWSE_TO", { url: getUrl(context, href) });
      });
    })
  );

const getUrl = (
  context: { matchedUrl: string; matchedUrlFull: string },
  href: string
) => {
  if (!href.startsWith("/")) {
    const baseUrl = context.matchedUrlFull.slice(0, -context.matchedUrl.length);
    return `${baseUrl}/${href}`;
  } else {
    return href;
  }
};

describe("getUrl", () => {
  test("uses / as base if link starts with /", () => {
    expect(
      getUrl(
        { matchedUrl: "/foobar", matchedUrlFull: "/wizard/foobar" },
        "/hej"
      )
    ).toBe("/hej");
  });

  test("uses matchedUrlFull - matchedUrl as base", () => {
    expect(
      getUrl({ matchedUrl: "/foobar", matchedUrlFull: "/wizard/foobar" }, "hej")
    ).toBe("/wizard/hej");
  });
});
