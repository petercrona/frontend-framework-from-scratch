import { TextInput } from "./TextInput";

describe("TextInput", () => {
  test("getValue returns written value", () => {
    TextInput(
      false,
      "off"
    )({ mkElement: document.createElement.bind(document) }).then((a) => {
      a.node.value = "Hello";
      expect(a.controllers.TextInput.get(a.node)?.self.getValue()).toBe(
        a.node.value
      );
    });
  });

  test("reset sets value to empty string", () => {
    TextInput(
      false,
      "off"
    )({ mkElement: document.createElement.bind(document) }).then((a) => {
      a.node.value = "Hello";
      const controller = a.controllers.TextInput.get(a.node)?.self;
      controller?.clear();
      expect(controller!.getValue()).toBe("");
    });
  });
});
