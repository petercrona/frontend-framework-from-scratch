import { mkEventbus } from "../../core/eventbus";
import { RouterEvents } from "../../core/router";
import { LinkWithColor } from "./LinkWithColor";

describe("LinkWithColor", () => {
  const context = (url: string) => ({
    eventBus: mkEventbus<RouterEvents>(),
    matchedUrl: "",
    matchedUrlFull: "",
    mkElement: document.createElement.bind(document),
    url,
  });

  test("if urls match a color is set", () => {
    LinkWithColor(
      "/foobar",
      ""
    )(context("/foobar")).then((a) => {
      expect(a.node.style.color).toBeTruthy();
    });
  });

  test("if link url is prefix of current url a color is set", () => {
    LinkWithColor(
      "/foobar",
      ""
    )(context("/foobar/fisken")).then((a) => {
      expect(a.node.style.color).toBeTruthy();
    });
  });

  test("if link url is not prefix of current url no color is set", () => {
    LinkWithColor(
      "/foobar",
      ""
    )(context("/fisk")).then((a) => {
      expect(a.node.style.color).toBeFalsy();
    });
  });

  test("if url changes to become match color is set", () => {
    const myContext = context("/fisk");

    LinkWithColor(
      "/foobar",
      ""
    )(myContext).then((a) => {
      myContext.eventBus.notify("BROWSE_TO", { url: "/foobar/hej" });
      expect(a.node.style.color).toBeTruthy();
    });
  });

  test("if url changes to not be a match color is removed", () => {
    const myContext = context("/foobar");

    LinkWithColor(
      "/foobar",
      ""
    )(myContext).then((a) => {
      myContext.eventBus.notify("BROWSE_TO", { url: "/hej" });
      expect(a.node.style.color).toBeFalsy();
    });
  });
});
