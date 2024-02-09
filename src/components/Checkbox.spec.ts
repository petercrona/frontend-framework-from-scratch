import { Checkbox } from "./Checkbox";

const context = () => ({ mkElement: document.createElement.bind(document) });

const mkComponent = () => Checkbox()(context());

describe("Checkbox", () => {
  test("by default not checked", () => {
    mkComponent().then((a) => {
      expect(a.node.checked).toBe(false);
    });
  });

  test("checked after one click", () => {
    Checkbox()(context()).then((a) => {
      a.node.click();
      expect(a.controllers.Checkbox.get(a.node)?.self.isChecked()).toBe(true);
    });
  });

  test("unchecked after two clicks", () => {
    Checkbox()(context()).then((a) => {
      a.node.click();
      a.node.click();
      expect(a.controllers.Checkbox.get(a.node)?.self.isChecked()).toBe(false);
    });
  });
});
