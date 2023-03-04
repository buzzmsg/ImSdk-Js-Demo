import { post } from "../utils/request";
import constants from "../constants";
import { nanoid } from "nanoid";

export interface UserLoginResult {
  auid: string;
  token: string;
}

export const userLogin = (data: { prefix: string; phone: string }) => {
  return post<UserLoginResult>("/login", {
    data,
  });
};

export interface GetAuthResult {
  ak: string;
  auid: string;
  authcode: string;
}

export const getSdkAuth = () => {
  return post<GetAuthResult>("/getAuth", {
    data: {
      token: constants.token,
    },
  });
};

const baseUrlDemo = "https://demo-sdk-test-api.rpgqp.com";

const getDemoCommonMessageData = () => ({
  amid: nanoid(),
  achat_id: "4749e5c76e1fa2fc_sss",
  sender_id: "33b1hvbe9lxf",
});

const createDemoMessageRequest = (url: string) => {
  return () =>
    post(`/${url}`, {
      baseURL: baseUrlDemo,
      data: getDemoCommonMessageData(),
    });
};

export const sendCardMessage = createDemoMessageRequest("sendCardMessage");
export const sendNotificationMessage = createDemoMessageRequest("sendNotificationMessage");
export const sendCustomizeMessage = createDemoMessageRequest("sendCustomizeMessage");
export const sendMiddleMessage = createDemoMessageRequest("sendMiddleMessage");
