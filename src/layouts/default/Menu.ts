import {
  ofElement,
  addChild,
  css,
  tell,
  run,
  askEventBus,
} from "src/core/component";
import { pipe, resetStyle } from "src/core/util";
import { cssVars } from "src/theme";
import { UserProfile } from "./UserProfile";
import { LinkWithColor } from "./LinkWithColor";
import { LogoutButton } from "./LogoutButton";
import { Button } from "../../components/Button";
import { RouterEvents } from "../../core/router";

const ShowMenu = pipe(
  Button("Menu"),
  askEventBus<RouterEvents>(),
  run((a, _, context) => {
    const getNav = () =>
      (a.node.getRootNode() as HTMLElement).querySelector("nav")!;

    a.node.addEventListener("click", (ev) => {
      ev.preventDefault();

      const nav = getNav();
      if (nav.style.height) {
        resetStyle(nav);
      } else {
        nav.style.height = `${nav.scrollHeight}px`;
      }
    });

    context.eventBus.register(a.node)("BROWSE_TO", () => {
      const nav = getNav();
      if (nav) {
        resetStyle(nav);
      }
    });
  })
);

export const Menu = pipe(
  ofElement("div"),
  addChild(
    pipe(
      ofElement("nav"),
      addChild(
        pipe(
          ofElement("div"),
          addChild(UserProfile, "userProfile"),
          addChild(ShowMenu, "showMenu")
        ),
        "userProfileShowMenu"
      ),
      addChild(
        pipe(
          ofElement("ul"),
          addChild(
            pipe(ofElement("li"), addChild(LinkWithColor("/todos/", "Todos")))
          ),
          addChild(
            pipe(ofElement("li"), addChild(LinkWithColor("/wizard/", "Wizard")))
          )
        )
      ),
      addChild(LogoutButton(), "logoutButton")
    )
  ),
  css({
    ":host": {
      background: "#444",
      position: "sticky",
      top: 0,
      left: 0,
      height: "100vh",
    },
    nav: {
      height: "100%",
      "box-sizing": "border-box",
      display: "grid",
      "grid-template-rows": "auto 1fr auto",
      transition: "height 0.3s ease",
    },
    ul: {
      "list-style": "none",
      padding: 0,
    },
    a: {
      color: cssVars.fg1,
      display: "block",
      padding: "10px",
    },
    "#userProfile": {
      padding: "10px",
      background: "#5d5d5d",
      "word-break": "break-word",
    },
    "#logoutButton, #showMenu": {
      padding: "10px",
      background: "#5d5d5d",
      border: 0,
      color: "#fff",
      cursor: "pointer",
      "text-decoration": "underline",
    },
    "#showMenu": {
      display: "none",
    },
    "#userProfileShowMenu": {
      display: "grid",
      "grid-template-columns": "1fr auto",
    },
  }),
  css(`
      @media (max-width: 800px) {
        :host {
          overflow-y: hidden;
          height: auto;
        }
        nav {
          height: 38px;
          overflow-y: hidden;
        }
        #showMenu {
          display: block;
        }
      }
    `),
  tell(["matchedUrl", ""]),
  tell(["matchedUrlFull", ""])
);
