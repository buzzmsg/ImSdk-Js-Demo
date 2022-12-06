import { post } from "../utils/request";
import constants from "../constants";

export interface UserLoginResult {
    auid: string;
    token: string;
}

export const userLogin = (data: { prefix: string; phone: string }) => {
    return post<UserLoginResult>("/api/login", {
        data,
    });
};

export interface GetAuthResult {
    ak: string;
    auid: string;
    authcode: string;
}

export const getSdkAuth = () => {
    return post<GetAuthResult>("/api/getAuth", {
        data: {
            token: constants.token,
        },
    });
};
