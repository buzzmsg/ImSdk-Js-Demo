import axios, {AxiosRequestConfig} from "axios";

interface Result {
  code: number;
  data: any;
  msg: string;
}

export const request = axios.create({
  timeout: 10000,
  baseURL: "https://dev-sdkdemo.imtmm.com:7504",
});

request.interceptors.request.use((value) => {
  if (value.url?.startsWith('/api/')) {
    value.url = value.url?.replace('/api', '')
  }
  return value
})

request.interceptors.response.use((value) => {
  const {status} = value;
  const data: Result = value.data;
  if (status === 200 && data?.code === 200) {
    return data.data;
  }
  throw new Error(data.msg ?? "请求错误");
});

export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  // @ts-ignore
  return request.get(url, config);
};

export const post = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  // @ts-ignore
  return request.post(url, config?.data, config);
};

export default request;
