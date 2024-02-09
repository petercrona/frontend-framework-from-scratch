import {
  ofElement,
  GetController,
  run,
  setChildren,
  wrapDiv,
  css,
  tellController,
} from "../../../core/component";
import { pipe, compact } from "../../../core/util";
import { cssVars } from "../../../theme";
import { TodoItem } from "./TodoItem";

export const TodoList = pipe(
  ofElement("ul"),
  tellController<GetController<typeof TodoItem>>(),
  run((app, _, context) => {
    const getControllers = () =>
      compact(
        Array.from(app.node.children).map((n) =>
          app.internalControllers.TodoItem.get(n)
        )
      );

    return Promise.resolve({
      name: "TodoList",
      addTodo: (todoItem: string) => {
        setChildren(app, context, "APPEND")([TodoItem(todoItem)], "TodoItem");
      },
      getAll: () => {
        return getControllers().map((t) => ({
          value: t.self.getValue(),
          checked: t.self.isChecked(),
        }));
      },
    });
  }),
  wrapDiv,
  css({
    ul: {
      "list-style": "none",
      padding: "0",
    },
    li: {
      display: "grid",
      "grid-template": "auto / 1fr auto",
      gap: cssVars.s1,
      "align-items": "center",
      margin: `${cssVars.s3} 0`,
    },
    label: {
      display: "flex",
      "align-items": "center",
      gap: cssVars.s1,
    },
    input: {
      margin: "0",
      width: "20px",
      height: "20px",
    },
  })
);
