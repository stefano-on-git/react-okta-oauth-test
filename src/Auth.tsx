import { useEffect, useState } from "react";
import { GlobalStore } from "./interfaces/Store";
import { Config, User } from "./interfaces/Models";
import useFetch from "./hooks/useFetch";
import { v4 as uuidv4 } from "uuid";
import { TokenResponse } from "./interfaces/request/Token";
import * as random from "randomstring";
import { encode as base64encode } from "base64-arraybuffer";

interface Props {
  store: GlobalStore;
  setStore: React.Dispatch<React.SetStateAction<GlobalStore>>;
  config: Config;
  children: JSX.Element;
}

const generateCodeChallenge = async (codeVerifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const base64Digest = base64encode(digest);
  // you can extract this replacing code to a function
  return base64Digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

export default function Auth({ store, setStore, config, children }: Props) {
  // url state for begin useFetch request
  const [fetchUrlToken, setFetchUrlToken] = useState<string>("");
  const [fetchUrlUser, setFetchUrlUser] = useState<string>("");
  // challenge code for token request
  const [challengeCode, setChallengeCode] = useState<string>("");

  // PKCE step 1
  // generate PKCE code challenge and
  // redirect to okta login to obtain code for token request
  const loginOKTA = () => {
    const codeVerifier = random.generate(128);
    localStorage.setItem("okta-code-verifier", codeVerifier);
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      window.location.href = `${
        config.okta.tenant
      }/oauth2/v1/authorize?client_id=${config.okta.clientID}&response_type=${
        config.okta.responseType
      }&response_mode=${config.okta.responseMode}&scope=${
        config.okta.scope
      }&redirect_uri=${
        config.okta.redirectUri
      }&state=${uuidv4()}&nonce=${uuidv4()}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    });
  };

  // PKCE step 2
  // useFetch for retrieve access token
  const fetchToken = useFetch<TokenResponse>(fetchUrlToken, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.okta.clientID,
      redirect_uri: config.okta.redirectUri,
      code: challengeCode,
      code_verifier: localStorage.getItem("okta-code-verifier") ?? ""
    })
  });

  // useFetch for retrieve okta user info
  const fetchUserInfo = useFetch<User>(fetchUrlUser, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${fetchToken.data?.access_token}`
    }
  });

  // on page load after redirect from okta login
  useEffect(() => {
    // save challenge code obtained from okta
    if (window.location.search.match(/code/gi)) {
      const codeParam = new URL(window.location.href).searchParams.get("code");
      if (codeParam) setChallengeCode(codeParam);
    }
  }, []);

  // after code acquisition
  // set url to begin access token fetch
  useEffect(() => {
    if (challengeCode !== "") {
      setFetchUrlToken(`${config.okta.tenant}/oauth2/v1/token`);
    }
  }, [config.okta.tenant, challengeCode]);

  // after access token acquisition
  // update global store with access token object
  // cancel search params from address bar
  // set url to begin user info fetch
  useEffect(() => {
    if (fetchToken.data && !store.token) {
      setStore({ ...store, token: fetchToken.data });
      setFetchUrlUser(`${config.okta.tenant}/oauth2/v1/userinfo`);
      window.history.pushState({}, document.title, window.location.pathname);
      localStorage.removeItem("okta-code-verifier");
    }
  }, [setStore, store, fetchToken.data, config.okta.tenant]);

  // update global store with user info object
  useEffect(() => {
    if (fetchUserInfo.data && !store.user)
      setStore({ ...store, user: fetchUserInfo.data });
  }, [fetchUserInfo.data, setStore, store]);

  // after user authentication
  // render children object
  if (store.user && store.user.sub !== "") return children;

  // before authentication
  // show okta login button
  if ((!store.user || store.user.sub === "") && challengeCode === "") {
    return (
      <div className="login-box">
        <h3>Login</h3>
        <button onClick={loginOKTA}>Login with OKTA</button>
      </div>
    );
  } else {
    return <div>Fetching access token...</div>;
  }
}
