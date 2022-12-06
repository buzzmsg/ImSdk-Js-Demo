export interface Constants {
  token: string;
  auid: string;
  ak: string;
  authcode: string;
}

export const constantsDefault = {
  token: '',
  auid: '',
  ak: '',
  authcode: '',
};

const constants: Constants = constantsDefault;

export default constants;
