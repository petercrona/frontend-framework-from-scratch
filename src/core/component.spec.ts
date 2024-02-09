import {
  App,
  GetController,
  addChild,
  ask,
  exportController,
  map,
  mount,
  ofElement,
  run,
  setChildren,
  tell,
  tellController,
} from "./component";
import { pipe, id } from "./util";

const context = () => ({ mkElement: document.createElement.bind(document) });

describe("ofElement", () => {
  test("creates component with element that had the modifier applied", () => {
    ofElement(
      "p",
      (e) => (e.textContent = "Hej")
    )(context()).then(({ node }) => {
      expect(node.textContent).toBe("Hej");
      expect(node.tagName).toBe("P");
    });
  });
});

describe("ask", () => {
  test("asks for specified value in context", () => {
    pipe(
      ofElement("p"),
      ask<{ foo: string }>(),
      run((_, __, context) => {
        expect(context.foo).toBe("bar");
      })
    )({ ...context(), foo: "bar" });
  });

  test("asks for specified value in context propagating from subcomponent", () => {
    pipe(
      ofElement("p"),
      addChild(
        pipe(
          ofElement("span"),
          ask<{ foo: string }>(),
          run((_, __, context) => {
            expect(context.foo).toBe("bar");
          })
        )
      )
    )({ ...context(), foo: "bar" });
  });
});

describe("tell", () => {
  test("adds specified value to context", () => {
    pipe(
      ofElement("p"),
      ask<{ foo: string }>(),
      run((_, __, context) => {
        expect(context.foo).toBe("bar");
      }),
      tell(["foo", "bar"])
    )(context());
  });

  test("adds specified value to context of subcomponent", () => {
    pipe(
      ofElement("p"),
      addChild(
        pipe(
          ofElement("span"),
          ask<{ foo: string }>(),
          run((_, __, context) => {
            expect(context.foo).toBe("bar");
          })
        )
      ),
      tell(["foo", "bar"])
    )(context());
  });
});

describe("map", () => {
  test("identity does nothing", () => {
    const original = ofElement("div");
    const mapped = map(id)(original);
    Promise.all([original(context()), mapped(context())]).then(
      ([original, mapped]) => {
        expect(original).toStrictEqual(mapped);
      }
    );
  });

  test("node can be changed", () => {
    const original = ofElement("strong");
    const mapped = map((a) => {
      return { ...a, node: document.createElement("em") };
    })(original);
    mapped(context()).then((mapped) => {
      expect(mapped.node.tagName).toBe("EM");
    });
  });

  test("shadow can be attached", () => {
    const original = ofElement("div");
    const mapped = pipe(
      original,
      map((a) => {
        const shadow = a.node.attachShadow({ mode: "closed" });
        return { ...a, shadow };
      })
    );
    mapped(context()).then((mapped) => {
      expect(mapped.shadow).toBeTruthy();
    });
  });

  test("composition preserved", () => {
    const original = ofElement("div");
    const mappedA = pipe(
      original,
      map((a) => {
        return { ...a, node: document.createElement("a") };
      }),
      map((a) => {
        return { ...a, node: document.createElement("strong") };
      })
    );
    const mappedB = pipe(
      original,
      map((a) => {
        const b = { ...a, node: document.createElement("a") };
        return { ...b, node: document.createElement("strong") };
      })
    );
    Promise.all([mappedA(context()), mappedB(context())]).then(
      ([original, mapped]) => {
        expect(original).toStrictEqual(mapped);
      }
    );
  });
});

describe("run", () => {
  test("function supplied to run will be called", () => {
    const fn = jest.fn();
    pipe(
      ofElement("div"),
      run(fn)
    )(context()).then(() => {
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  test("function supplied can return controller", () => {
    const fn = jest.fn();
    pipe(
      ofElement("div"),
      run(() =>
        Promise.resolve({
          name: "Hej",
          sayHi: fn,
        })
      )
    )(context()).then((a) => {
      a.controllers.Hej.get(a.node)?.self.sayHi();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

describe("exportController", () => {
  test("exports inner controller by putting on parent node with specified id", () => {
    const fn = jest.fn();
    const childWithController = pipe(
      ofElement("div"),
      run(() =>
        Promise.resolve({
          name: "ChildController",
          sayHi: fn,
        })
      )
    );

    pipe(
      ofElement("div"),
      addChild(childWithController, "child"),
      exportController((controllers) => [
        "child",
        controllers.ChildController,
        "exportId",
      ])
    )(context()).then((a) => {
      a.controllers.ChildController.get(a.node)?.exportId.sayHi();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

describe("addChild", () => {
  test("Add child to the HTMLElement", () => {
    pipe(
      ofElement("div"),
      addChild(ofElement("strong"))
    )(context()).then((a) => {
      expect(a.node.children[0].tagName).toBe("STRONG");
    });
  });

  test("Add child to the HTMLElement with provided id", () => {
    pipe(
      ofElement("div"),
      addChild(ofElement("strong"), "childId")
    )(context()).then((a) => {
      expect(a.node.children[0].id).toBe("childId");
    });
  });

  test("Add child exposes the childs main controller as internalController of parent", () => {
    const fn = jest.fn();

    pipe(
      ofElement("div"),
      addChild(
        pipe(
          ofElement("strong"),
          run(() =>
            Promise.resolve({
              name: "ChildController",
              sayHi: fn,
            })
          )
        ),
        "childId"
      )
    )(context()).then((a) => {
      a.internalControllers.ChildController.get(
        a.node.querySelector("#childId")!
      )?.self.sayHi();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

describe("css", () => {
  test("not possible to test with JSDOM, perhaps switch to StyleX?", () => {
    expect(true).toBe(true);
  });
});

describe("setChildren", () => {
  test("Sets specified children to element", () => {
    let setChildrenPromise: Promise<App> | null = null;

    pipe(
      ofElement("div"),
      run((a) => {
        setChildrenPromise = setChildren(a, context())(
          [ofElement("p")],
          "fdsa"
        );
      })
    )(context()).then((a) => {
      setChildrenPromise?.then(() => {
        expect(a.node.childNodes.length).toBe(1);
      });
    });
  });

  test("Controllers of children added as internal controllers in parent", () => {
    let setChildrenPromise: Promise<App> | null = null;
    const fn = jest.fn();
    const fn2 = jest.fn();
    const ChildComponent = () =>
      pipe(
        ofElement("p"),
        run(() => Promise.resolve({ name: "hej", sayHi: fn }))
      );
    const ChildComponentB = () =>
      pipe(
        ofElement("p"),
        run(() => Promise.resolve({ name: "hello", sayHello: fn2 }))
      );

    pipe(
      ofElement("div"),
      tellController<
        GetController<typeof ChildComponent> &
          GetController<typeof ChildComponentB>
      >(),
      run((a) => {
        setChildrenPromise = setChildren(a, context())(
          [ChildComponent()],
          "fdsa"
        ).then(() =>
          setChildren(a, context(), "APPEND")([ChildComponentB()], "fdsaB")
        );
      })
    )(context()).then((a) => {
      setChildrenPromise?.then(() => {
        a.internalControllers.hej.get(a.node.firstChild!)?.self.sayHi();
        a.internalControllers.hello.get(a.node.lastChild!)?.self.sayHello();
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn2).toHaveBeenCalledTimes(1);
      });
    });
  });

  test("By default setChildren removes existing children", () => {
    let setChildrenPromise: Promise<App> | null = null;

    pipe(
      ofElement("div"),
      run((a) => {
        setChildrenPromise = setChildren(a, context())(
          [ofElement("div")],
          "foo"
        ).then(() => setChildren(a, context())([ofElement("p")], "paragraph"));
      })
    )(context()).then((a) => {
      setChildrenPromise?.then(() => {
        expect(a.node.childNodes.length).toBe(1);
      });
    });
  });
});

describe("mount", () => {
  test("replaces element with element by component", () => {
    const container = document.createElement("div");
    const mountPoint = document.createElement("div");
    container.appendChild(mountPoint);

    const comp = ofElement("p");

    mount(mountPoint, comp(context())).then(() => {
      expect(container.firstElementChild?.tagName).toBe("P");
      expect(container.childNodes.length).toBe(1);
    });
  });
});
