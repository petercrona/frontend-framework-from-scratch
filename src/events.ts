import { RouterEvents } from "./core/router";

export interface Events extends RouterEvents {
  LOGIN: { id: number; name: string };
  LOGOUT: { wasAuthenticated: boolean };
}
