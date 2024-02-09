import { Todos, main } from ".";
import { getControllerForTest } from "../../core/component";

describe("Todos", () => {
  const context = () => ({ mkElement: document.createElement.bind(document) });

  test("Has no todos at start", () => {
    Todos()(context()).then((a) => {
      const todoListController = getControllerForTest(a)(
        a.internalControllers.TodoList,
        main
      )!;

      expect(todoListController.TodoList.getAll().length).toBe(0);
    });
  });
});
