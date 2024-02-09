import { getNode } from "../../../core/component";
import { TodoAdd, todoNameId } from "./TodoAdd";

describe("TodoAdd", () => {
  test("onClick called with value of input field", (done) => {
    TodoAdd({ mkElement: document.createElement.bind(document) }).then((a) => {
      const input = getNode(a)(todoNameId) as HTMLInputElement;

      input.value = "Hej";

      a.controllers.TodoAdd.get(a.node)?.self.onClick((x) => {
        expect(x).toBe("Hej");
        done();
      });

      a.shadow!.querySelector("form")!.submit();
    });
  });

  test("After form submit the input is cleared", (done) => {
    TodoAdd({ mkElement: document.createElement.bind(document) }).then((a) => {
      const input = getNode(a)(todoNameId) as HTMLInputElement;

      input.value = "Hej";

      a.controllers.TodoAdd.get(a.node)?.self.onClick((x) => {
        setTimeout(() => {
          expect(input.value).toBe("");
          done();
        });
      });

      a.shadow!.querySelector("form")!.submit();
    });
  });
});
