import { Button } from "../../../components/Button";
import {
  ofElement,
  addChild,
  css,
  exportController,
} from "../../../core/component";
import { pipe, mkId } from "../../../core/util";
import { cssVars } from "../../../theme";

const saveId = mkId();

export const Footer = pipe(
  ofElement("footer"),
  addChild(Button("Save"), saveId),
  css({
    button: {
      padding: cssVars.p1,
    },
  }),
  exportController((cs) => [saveId, cs.Button, "Save"])
);
