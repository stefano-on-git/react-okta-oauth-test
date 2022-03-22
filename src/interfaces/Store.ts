import { User } from "./Models";
import { TokenResponse } from "./request/Token";

export interface GlobalStore {
  level1: {
    countLvl1: number;
  };
  level2: {
    countLvl2: number;
  };
  user: User | undefined;
  token: TokenResponse | undefined;
}
