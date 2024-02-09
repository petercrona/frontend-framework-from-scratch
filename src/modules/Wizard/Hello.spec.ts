import { mkEventbus } from "../../core/eventbus";
import { Events } from "../../events";
import { Hello } from "./Hello";

describe("Hello", () => {
  test("If LOGIN event happened before node still gets it", () => {
    const eventBus = mkEventbus<Events>();
    eventBus.notify("LOGIN", { id: 1, name: "Henrik" });

    Hello()({
      eventBus,
      matchedUrl: "",
      matchedUrlFull: "",
      mkElement: document.createElement.bind(document),
    }).then((a) => {
      expect(a.node.textContent?.includes("Henrik")).toBe(true);
    });
  });

  test("If LOGIN event happened after mount it is reflected", () => {
    const eventBus = mkEventbus<Events>();

    Hello()({
      eventBus,
      matchedUrl: "",
      matchedUrlFull: "",
      mkElement: document.createElement.bind(document),
    }).then((a) => {
      eventBus.notify("LOGIN", { id: 1, name: "Henrik" });
      expect(a.node.textContent?.includes("Henrik")).toBe(true);
    });
  });

  test("If no LOGIN event default text is shown", () => {
    Hello()({
      eventBus: mkEventbus<Events>(),
      matchedUrl: "",
      matchedUrlFull: "",
      mkElement: document.createElement.bind(document),
    }).then((a) => {
      expect(a.node.textContent).toBe("Go to World");
    });
  });
});
