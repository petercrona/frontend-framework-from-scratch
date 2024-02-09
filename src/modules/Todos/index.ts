import {
  ofElement,
  addChild,
  exportController,
  run,
  css,
} from "../../core/component";
import { mkId, pipe } from "../../core/util";
import { cssVars } from "../../theme";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { TodoAdd } from "./components/TodoAdd";
import { TodoList } from "./components/TodoList";

export const todoAddId = mkId(),
  todoListId = mkId(),
  footer = mkId(),
  main = mkId();

const Main = pipe(
  ofElement("main"),
  addChild(TodoAdd, todoAddId),
  addChild(TodoList, todoListId),
  exportController((cs) => [todoAddId, cs.TodoAdd, "TodoAdd"]),
  exportController((cs) => [todoListId, cs.TodoList, "TodoList"])
);

export const Todos = () => pipe(
  ofElement("div"),
  addChild(Header),
  addChild(Main, main),
  addChild(Footer, footer),
  css({
    header: {
      "margin-bottom": cssVars.s4,
    },
    footer: {
      margin: `${cssVars.s4} 0 0`,
    },
    a: {
      color: cssVars.fg1,
    },
  }),
  run(({ internalControllers }, { getController }) => {
    const todoAdd = getController(internalControllers.TodoAdd, main)!.TodoAdd;
    const todoList = getController(
      internalControllers.TodoList,
      main
    )!.TodoList;
    const save = getController(internalControllers.Button, footer)!.Save;

    todoAdd.onClick((value) => {
      todoList.addTodo(value);
    });

    save.onClick(() => {
      console.log(todoList.getAll());
    });
  })
);
