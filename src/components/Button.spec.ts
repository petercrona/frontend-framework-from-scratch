import { Button } from "./Button";

const context = () => ({ mkElement: document.createElement.bind(document) });

const mkButton = (text: string, type?: HTMLButtonElement["type"]) =>
  Button(text, type)(context());

describe("Button", () => {
  test("text content is set", () => {
    const text = "MyText";
    mkButton(text).then((a) => {
      expect(a.node.textContent).toBe(text);
    });
  });

  test("onClick called on element click", () => {
    const fn = jest.fn();
    Button("text")(context()).then((a) => {
      a.controllers.Button.get(a.node)?.self.onClick(fn);
      a.node.click();
      expect(fn).toHaveBeenCalled();
    });
  });

  test("type is correctly set at button", () => {
    mkButton("", "reset").then((a) => expect(a.node.type).toBe("reset"));
  });

  test("by default button has type submit", () => {
    mkButton("").then((a) => {
      expect(a.node.type).toBe("submit");
    });
  });
});
