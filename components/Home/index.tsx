import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.css";
import { ChatView, IMSdk, LogModeEnum, Provider, UserInfo, ConversationViewModel } from "imsdkweb";
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Space,
  Spin,
  Switch,
  Tabs,
  UploadFile,
} from "antd";
import { getSdkAuth, userLogin } from "./services";
import constants from "./constants";
import Uploader from "./components/Uploader";
import { ButtonProps } from "antd/lib/button/button";

const getImage = () => {
  return `https://api.multiavatar.com/${Math.random().toString(36).slice(-6)}.png`;
};
const App = () => {
  const [aChatId, setAChatId] = useState<string>();
  const [prefix, setPrefix] = useState<string>("86");
  const [phone, setPhone] = useState<string>("18208174696");
  const sdkRef = useRef<IMSdk>();
  const [loginStatus, setLoginStatus] = useState<"loading" | "success" | "fail">();
  const [content, setContent] = useState("");
  const [auidChat, setAuidChat] = useState("8792c0452ef24822");
  const [attachmentList, setAttachmentList] = useState<UploadFile[]>([]);
  const [conViewModel, setConViewModel] = useState<ConversationViewModel>();
  const [autoLogin, setAutoLogin] = useState(Number(localStorage.getItem("autoLogin") ?? 0) === 1);

  const updateConstants = (obj: any) => {
    for (const k in obj) {
      // @ts-ignore
      constants[k] = obj[k];
    }
  };

  const onGetAuth = async () => {
    try {
      const res = await getSdkAuth();
      updateConstants(res);
    } catch (e: any) {
      message.error(`获取授权失败：${e.message}`);
    }
  };

  const initSdk = () => {
    const sdk = IMSdk.getInstance(constants.ak, "pro");
    sdk.setDelegate({
      authCodeExpire() {
        if (constants.authcode.length > 0) {
          sdk.setAuthCode(constants.authcode);
          return;
        }

        onGetAuth().then(() => {
          sdk.setAuthCode(constants.authcode);
        });
      },
      onShowUserinfo(auids) {
        const infos: UserInfo[] = auids.map((auid) => ({
          auid,
          item: {
            name: auid,
            avatar: getImage(),
          },
        }));
        sdk.setUserInfo(infos);
      },
      onReceiveMessages: (amids) => {
        console.log(amids);
      },
    });
    setConViewModel(sdk.createConversationViewModel());
    sdkRef.current = sdk;
  };

  const initUser = () => {
    try {
      sdkRef.current?.initUser(constants.auid);
    } catch (e) {
      console.log(e);
    }
  };

  const login = async () => {
    if (prefix.length === 0) {
      message.info("please input phone number prefix");
      return;
    }
    if (phone.length === 0) {
      message.info("please input phone number");
      return;
    }
    setLoginStatus("loading");
    try {
      const res = await userLogin({
        prefix,
        phone,
      });
      updateConstants(res);

      // init sdk
      await onGetAuth();
      // open debug mode
      IMSdk.setLogMode(LogModeEnum.debug);
      initSdk();
      initUser();
      setLoginStatus("success");
    } catch (e: any) {
      setLoginStatus("fail");
      message.error(`登录失败：${e.message}`);
    }
  };

  useEffect(() => {
    if (autoLogin) login();
  }, []);

  const createChat = () => {
    if (!sdkRef.current) {
      message.info("please login first");
      return;
    }
    const chatId = "key_chat_id";
    sdkRef.current?.createChat({
      aChatId: chatId,
      auids: [auidChat],
      chatName: "",
      delegate: {
        onSucc: () => {
          setAChatId(chatId);
          console.log("create chat success");
        },
        onError: (res) => {
          console.log(res);
        },
      },
    });
  };

  const sendMessage = () => {
    if (!aChatId) {
      message.info("please create chat");
      return;
    }
    if (content.length === 0) {
      message.info("please input content");
      return;
    }
    const amid = new Date().getTime().toString();
    sdkRef.current?.sendTextMessage({
      amid,
      content,
      aChatId,
    });
  };

  const sendAttachmentMessage = (image: boolean = false) => {
    if (!sdkRef.current) return;
    console.log(attachmentList);

    if (!aChatId) {
      message.info("please create chat");
      return;
    }
    if (attachmentList.length === 0) {
      message.info("请选择文件");
      return;
    }
    const amid = new Date().getTime().toString();
    if (image) {
      sdkRef.current.sendImageMessage({
        data: attachmentList[0],
        aChatId,
        amid,
      });
    } else {
      sdkRef.current.sendAttachmentMessage({
        data: attachmentList[0],
        aChatId,
        amid,
      });
    }
  };

  const logout = () => {
    sdkRef.current?.loginOut();
  };

  const getUnreadCount = () => {
    message.info(`unread count: ${conViewModel?.getUnReadCount()}`);
  };

  const renderBadgeText = (color: string, text: string) => {
    return (
      <Space>
        <Badge color={color} />
        <span>{text}</span>
      </Space>
    );
  };

  const onCardMessageClick = (amid: string, buttonId: string) => {
    console.log(amid, buttonId);
  };

  const onMiddleMessageClick = (amid: string, tmpId: string, buttonId: string) => {
    console.log(amid, tmpId, buttonId);
  };

  const onNotificationMessageClick = (amid: string, buttonId: string) => {
    console.log(amid, buttonId);
  };

  const onConversationItemClick = (aChatId: string) => {
    console.log(aChatId);
  };

  const disableCardMessage = () => {
    sdkRef.current?.disableCardMessage("asdasd", ["btn_2"]);
  };

  const ConversationView = useMemo(() => conViewModel?.getView(), [conViewModel]);

  const setFolder = () => {
    conViewModel?.setFolder({
      aChatId: "test",
      name: "不感兴趣的聊天",
      imageData: getImage(),
      content: "test content",
    });
    conViewModel?.updateSelector([], ["key_chat_id"]);
  };

  const removeFolder = () => {
    conViewModel?.removeFolder("test");
    conViewModel?.updateSelector([]);
  };

  const setConversationSubTitle = () => {
    sdkRef.current?.setConversationSubTitle({
      subTitles: [{ aChatId: "key_chat_id", subTitle: "my subTitle" }],
    });
  };

  const setConversationMarker = () => {
    sdkRef.current?.setConversationMarker({
      markers: [{ aChatId: "key_chat_id", icon: getImage() }],
    });
  };

  const setConversationMute = (isMute: boolean) => {
    sdkRef.current?.setConversationMute("key_chat_id", isMute);
  };

  const onAutoLoginChange = (auto: boolean) => {
    setAutoLogin(auto);
    if (auto) localStorage.setItem("autoLogin", "1");
    else localStorage.removeItem("autoLogin");
  };

  const setSelector = () => {};

  const getBtn = (body: string, onClick: () => void, buttonProps?: ButtonProps) => {
    return (
      <Col key={body}>
        <Button onClick={onClick} {...buttonProps}>
          {body}
        </Button>
      </Col>
    );
  };

  const tabs = [
    {
      title: "Base",
      items: [
        getBtn("Logout", logout),
        getBtn("Test", () => {
          conViewModel?.updateSelector([], ["key_chat_id"]);
        }),
        getBtn("Test1", () => {
          conViewModel?.updateSelector([], []);
        }),
        <Space key="autoLogin">
          <Switch checked={autoLogin} onChange={onAutoLoginChange} />
          <span>Auto Login</span>
        </Space>,
      ],
    },
    {
      title: "Chat",
      items: [
        <Col key="Choose File">
          <Uploader fileList={attachmentList} onFileListChange={setAttachmentList} />
        </Col>,
        getBtn("Send Image", () => sendAttachmentMessage(true)),
        getBtn("Send File", () => sendAttachmentMessage(false)),
      ],
    },
    {
      title: "Conversation",
      items: [
        getBtn("Get Unread Count", getUnreadCount),
        getBtn("Disable Card Message", disableCardMessage),
        getBtn("Set Folder", setFolder),
        getBtn("Remove Folder", removeFolder),
        getBtn("Set SubTitle", setConversationSubTitle),
        getBtn("Set Marker", setConversationMarker),
        getBtn("Set Mute true", () => setConversationMute(true)),
        getBtn("Set Mute false", () => setConversationMute(false)),
      ],
    },
  ];

  return (
    <div className={styles.app}>
      <Row gutter={24}>
        <Col flex={1}>
          <Card title="User Login">
            {loginStatus === "loading" ? (
              <Space>
                login
                <Spin />
              </Space>
            ) : loginStatus === "success" ? (
              renderBadgeText("green", `login succeed, auid: ${constants.auid}`)
            ) : loginStatus === "fail" ? (
              renderBadgeText("red", "login faile")
            ) : (
              renderBadgeText("yellow", "wait login")
            )}
            <Row gutter={12} style={{ marginTop: 20 }}>
              <Col>
                <Input
                  style={{ width: 50 }}
                  placeholder="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                />
              </Col>
              <Col flex={1}>
                <Input
                  placeholder="your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Col>
              <Col>
                <Button type="primary" onClick={login} style={{ width: 100 }}>
                  Login
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col flex={1}>
          <Card title="Create Chat">
            {aChatId
              ? renderBadgeText("green", `chat created，aChatId: ${aChatId}`)
              : renderBadgeText("yellow", `waiting to create chat`)}
            <Row gutter={12} style={{ marginTop: 20 }}>
              <Col flex={1}>
                <Input
                  placeholder="chat user auid"
                  value={auidChat}
                  onChange={(e) => setAuidChat(e.target.value)}
                />
              </Col>
              <Col>
                <Button type="primary" onClick={createChat} style={{ width: 100 }}>
                  Create
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Card title="Chat" bodyStyle={{ padding: 0 }}>
        <Provider>
          <Row style={{ height: 400 }}>
            <Col style={{ height: "100%" }}>
              {ConversationView && (
                <ConversationView delegate={{ onItemClick: onConversationItemClick }} />
              )}
            </Col>
            <Col flex="1" style={{ height: "100%" }}>
              <ChatView
                chatId={aChatId}
                delegate={{
                  onCardMessageClick,
                  onMiddleMessageClick,
                  onNotificationMessageClick,
                }}
              />
            </Col>
          </Row>
        </Provider>
        <div style={{ padding: 24 }}>
          <Row gutter={24}>
            <Col flex={1}>
              <Input
                placeholder="message content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Col>
            <Col>
              <Button type="primary" style={{ width: 100 }} onClick={sendMessage}>
                Send
              </Button>
            </Col>
          </Row>
          <Tabs
            items={tabs.map(({ title, items }) => ({
              tabKey: title,
              label: title,
              key: title,
              children: <Row gutter={[24, 12]}>{items}</Row>,
            }))}
          />
        </div>
      </Card>
    </div>
  );
};

export default App;
