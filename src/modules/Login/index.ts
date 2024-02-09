import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import {
  addChild,
  askEventBus,
  css,
  exportController,
  ofElement,
  run,
} from "../../core/component";
import { pipe } from "../../core/util";
import { Events } from "../../events";

const Title = () =>
  pipe(
    ofElement("h1"),
    askEventBus<Events>(),
    run((a, _, context) => {
      const listen = context.eventBus.register(a.node);

      listen(
        "LOGOUT",
        (ev) => {
          if (ev.detail.wasAuthenticated) {
            a.node.textContent = "Bye bye!";
          } else {
            a.node.textContent = "Welcome!";
          }
        },
        { wasAuthenticated: false }
      );
    }),
    css({
      ":host": {
        margin: 0,
        "text-align": "center",
        "line-height": "22px",
      },
    })
  );

const LoginForm = () =>
  pipe(
    ofElement("form"),
    askEventBus<Events>(),
    addChild(
      pipe(
        ofElement("label", (e) => (e.textContent = "Name")),
        addChild(TextInput(true, "on"), "loginNameText"),
        exportController((c) => ["loginNameText", c.TextInput, "loginName"])
      ),
      "loginName"
    ),
    addChild(Button("Log In")),
    run((a, util, context) => {
      const loginNameController = util.getController(
        a.internalControllers.TextInput,
        "loginName"
      )!.loginName;

      a.node.addEventListener("submit", (ev) => {
        ev.preventDefault();
        context.eventBus.notify("LOGIN", {
          id: 1,
          name: loginNameController.getValue(),
        });
      });
    })
  );

export const Login = pipe(
  ofElement("div"),
  addChild(Title()),
  addChild(LoginForm()),
  css({
    ":host": {
      display: "grid",
      "grid-template-columns": "1fr",
      "justify-items": "center",
      gap: "20px",
      color: "#fff",
    },
    form: {
      display: "flex",
      "flex-direction": "column",
      gap: "20px",
    },
    label: {
      display: "flex",
      "flex-direction": "column",
      gap: "5px",
    },
    button: {
      background: "transparent",
      border: "1px solid #fff",
      padding: "10px",
      "font-weight": "bold",
      color: "#fff",
    },
    input: {
      padding: "10px",
    },
  })
);
