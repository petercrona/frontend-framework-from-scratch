import { mkEventbus } from "./eventbus";

describe("eventbus", () => {
  test("registered nodes are notified", () => {
    const eventBus = mkEventbus<{ Hej: string }>();
    const nodeA = document.createElement("div");
    const fnA = jest.fn();
    const nodeB = document.createElement("div");
    const fnB = jest.fn();

    eventBus.register(nodeA)("Hej", fnA);
    eventBus.register(nodeB)("Hej", fnB);

    eventBus.notify("Hej", "Hello");

    expect(fnA).toHaveBeenCalledTimes(1);
    expect(fnB).toHaveBeenCalledTimes(1);
  });

  test("notified with correct event", (done) => {
    const eventBus = mkEventbus<{ Hej: string }>();
    const nodeA = document.createElement("div");

    eventBus.register(nodeA)("Hej", (ev) => {
      expect(ev.detail).toBe("Hello");
      done();
    });

    eventBus.notify("Hej", "Hello");
  });

  test("notified with event even if event sent before registration", (done) => {
    const eventBus = mkEventbus<{ Hej: string }>();
    const nodeA = document.createElement("div");

    eventBus.notify("Hej", "Hello");

    eventBus.register(nodeA)("Hej", (ev) => {
      expect(ev.detail).toBe("Hello");
      done();
    });
  });

  test("notified with only last event", (done) => {
    const eventBus = mkEventbus<{ Hej: string }>();
    const nodeA = document.createElement("div");

    eventBus.notify("Hej", "Hello");
    eventBus.notify("Hej", "Fisken");

    eventBus.register(nodeA)("Hej", (ev) => {
      expect(ev.detail).toBe("Fisken");
      done();
    });
  });

  test("not notified if unregistered", () => {
    const eventBus = mkEventbus<{ Hej: string }>();
    const nodeA = document.createElement("div");
    const fnA = jest.fn();

    const unregister = eventBus.register(nodeA)("Hej", fnA);
    unregister();

    eventBus.notify("Hej", "Hello");

    expect(fnA).toHaveBeenCalledTimes(0);
  });
});
