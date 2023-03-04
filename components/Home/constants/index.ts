export interface Constants {
  token: string;
  auid: string;
  ak: string;
  authcode: string;
}

export const ImHosts = {
  dev: {
    apiHost: "https://dev-sdk-api.buzzmsg.com",
    wsHost: "wss://dev-sdk-tcp.buzzmsg.com",
  },
  pre: {
    apiHost: "https://dev-sdk-api.buzzmsg.com",
    wsHost: "wss://dev-sdk-tcp.buzzmsg.com",
  },
  pro: {
    apiHost: "https://sci.buzzmsg.com",
    wsHost: "wss://ws.buzzmsg.com",
  },
};

export const constantsDefault = {
  token: "",
  auid: "",
  ak: "",
  authcode: "",
};

const constants: Constants = constantsDefault;

export default constants;
