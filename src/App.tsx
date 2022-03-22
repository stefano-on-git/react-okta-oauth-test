import { useState } from "react";
import useFetch from "./hooks/useFetch";
import * as models from "./interfaces/Models";
import { GlobalStore } from "./interfaces/Store";
import Auth from "./Auth";
import Level1 from "./Level1";
import Level2 from "./Level2";

import "./styles.css";

export default function App() {
  const [store, setStore] = useState<GlobalStore>({
    level1: {
      countLvl1: 0
    },
    level2: {
      countLvl2: 0
    },
    user: undefined,
    token: undefined
  });

  /*   useEffect(() => {
    console.log(store);
  }, [store]); */

  const fetchConfig = useFetch<models.Config>("./config.json");

  if (fetchConfig.data) {
    document.title = fetchConfig.data.appTitle;
    fetchConfig.data.okta.redirectUri = window.location.origin;
  }

  return fetchConfig.data ? (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Auth store={store} setStore={setStore} config={fetchConfig.data}>
        <Level1 store={store} setStore={setStore}>
          <Level2 store={store} setStore={setStore}></Level2>
        </Level1>
      </Auth>
    </div>
  ) : null;
}
