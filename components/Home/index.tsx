import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.css";
import {
  ChatDelegate,
  ChatInfo,
  ChatView,
  ConversationViewModel,
  CustomAvatarViewUserInfo,
  IMSdk,
  LoginErrorCode,
  LogModeEnum,
  MessageMultipleChooser,
  Provider,
  UserInfo,
  IMEnvironmentType,
  IMMessageMenuType,
  ChatViewProps,
} from "buzzmsg";
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  InputNumber,
  message,
  Modal,
  Popover,
  Row,
  Space,
  Spin,
  Switch,
  Tabs,
  UploadFile,
} from "antd";
import constants, { ImHosts } from "./constants";
import Uploader from "./components/Uploader";
import { ButtonProps } from "antd/lib/button/button";
import { nanoid } from "nanoid";
import { createGroupChatId, createSingleChatId } from "./utils";
import {
  getSdkAuth,
  sendCardMessage,
  sendCustomizeMessage,
  sendMiddleMessage,
  sendNotificationMessage,
  userLogin,
} from "./services";
const bgImage = "/assets/bg-chat.png";
const chatImagePlaceholder = "/assets/logo.png";
const avatarPlaceholder = "/assets/image-default.png";

const getImage = () => {
  // return `https://api.multiavatar.com/${Math.random().toString(36).slice(-6)}.png`;
  return "https://fakeimg.pl/300/";
};

const users = [
  {
    auid: "ced5aca335105300",
    authcode:
      "HXEaKdZmvDo88PbqAjcdbP5boFCwcdhq4eMSHgt74UmsyANX8k4VjhVGUUzFjyrbkL74emyHtRUdybduGNGxrG61iEPbNHECHJxEX6D4NaJxEdbume9Sx3PdSEir65q8ZdUG6MjENVdhKnSu8UYaWGdnuQm8XtnBderr16MSdS71x7EbGHgawyDQRSiZufy35EYGhNTFdNvV1NLuB1ugTyJuiqR6",
  },
  {
    auid: "e43e232c86c9",
    authcode:
      "HXEaKdZmvDo88P1EYc2y2ErnSi12FcmwWbg76pZs51q6pvWPfD2228gyfbHDPdQT2gGKQHSgn7VKxw9sYZa4KSviUzQ9fi8ksurLDrAqShBnmwrctbPS79oTHxYJtab5Sk7gCgQqCLM7kp9DFwzmV3ZQumL6MrmFTucCJL8mxywpMcuSUp3ZtuoKzz1vHE2g2rFxm1UGKeUAmjhqgSFRhSMueKPr",
  },
  {
    auid: "2964ad641972030d",
    authcode:
      "HXEaKdZmvDo88P2HxjYGzvzjpGp7EMCEXCskFMzBSRs1MeVC7F7pr4T2rS1QJqghpNxN2DC21ZicMtqDpQeEbT3eNgQTakfHTTCCkf4zooiTdTV9rtRksk9PaF9m5iAbsGkYxb6eouSXHqVTtUmNEeN2iLmhNY7kB1riV1YFY7zsGJWmErUz94xhLCDeTJqaen3A4moEyvEP4hK9pdKuLpUQa3Ve",
  },
  {
    auid: "23083334c27fd9e5",
    authcode:
      "HXEaKdZmvDo88P3QKRV5JmzagDAQruZxreVdUCUos7R6V1UpoSdaxQNbLCx75YioEXvUM5A1rURiE83eY1RSZGLgj7r7MhAj7pFaxfKQNFBJRA5ySwy1C81QNa22mxkhz5Db3nfmjWZmZYVqAcj8Nt8ZGe2LxAXtxH4EF4Nd8XwhKCa7Wyh1s3NmvGLvofxqaXrMsW2aWPeTc4GyXw58u2jTBXCQ",
  },
];

const App = () => {
  const [aChatId, setAChatId] = useState<string>();
  const [prefix, setPrefix] = useState<string>("86");
  const [phone, setPhone] = useState<string>("19012345678");
  const sdkRef = useRef<IMSdk | null>(null);
  const [loginStatus, setLoginStatus] = useState<"loading" | "success" | "fail">();
  const [content, setContent] = useState("");
  const [auidChat, setAuidChat] = useState("");
  const [attachmentList, setAttachmentList] = useState<UploadFile[]>([]);
  const [conViewModel, setConViewModel] = useState<ConversationViewModel>();
  const [autoLogin, setAutoLogin] = useState(Number(localStorage.getItem("autoLogin") ?? 0) === 1);
  const multipleChooser = useRef<MessageMultipleChooser>();
  const [quoteMsg, setQuoteMsg] = useState<any>();
  const [userIndex, setUserIndex] = useState(1);
  const [count, setCount] = useState(0);
  const [isShowChatView, setIsShowChatView] = useState(true);

  const conViewModelRef = useRef(conViewModel);

  const onChatIdChange = (id: string) => {
    setAChatId(id);
  };

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
      // updateConstants({
      //   ak: "TMMTMM",
      //   ...users[userIndex],
      // });
    } catch (e: any) {
      message.error(`获取授权失败：${e.message}`);
    }
  };

  const initSdk = () => {
    // const sdk = IMSdk.getInstance(constants.ak, "pro", "6F83789E0A8E1494");
    const env = IMEnvironmentType.DEVELOPMENT;
    const sdk = IMSdk.getInstance(constants.ak, {
      env,
      deviceId: "6F83789E0A8E1494",
      ...ImHosts[env],
      // demo
      apiHost: "https://demo-sdk-api.buzzmsg.com",
      wsHost: "wss://dev-sdk-tcp.buzzmsg.com/wsConnect",
    });
    sdk.setDelegate({
      async authCodeExpire(auid, code) {
        console.log("authCodeExpire", auid, code);
        switch (code) {
          case LoginErrorCode.TOKEN_EXPIRE:
            await onGetAuth();
            await sdk.setAuthCode(constants.authcode);
          case LoginErrorCode.AUTHCODE_EMPTY:
            await sdk.setAuthCode(constants.authcode);
            break;
          case LoginErrorCode.ENV_NOT_MATCH:
            console.error("env not match");
            break;
          default:
            console.error("login failed, unknown error");
            break;
        }
      },
      onShowUserInfo(auids) {
        const infos: UserInfo[] = auids.map((auid) => ({
          auid,
          item: {
            name: auid,
            avatar: getImage(),
          },
        }));
        sdk.setUserInfo(infos);
      },
      onShowChatInfo(aChatIds) {
        console.log("onShowChatInfo", aChatIds);
        const infos: ChatInfo[] = aChatIds.map((aChatId) => ({
          aChatId,
          item: {
            name: aChatId,
            avatar: getImage(),
          },
        }));
        sdk.setChatInfo(infos);
      },
      async onReceiveMessages(messages) {
        console.log("onReceiveMessages", messages);
        const count = await conViewModelRef.current?.getUnReadCount();
        console.log("getUnReadCount", count);
      },
      onDragFilesIntoChat: console.log,
      onCloseByOtherDevice() {
        IMSdk.instance.loginOut();
      },
      onReceiveCmd(data) {
        console.log("onReceiveCmd", data);
      },
    });
    sdk.setImUiSetting({
      chatBackground: `url(${bgImage})`,
      // chatBackground: `#333`,
      chatImagePlaceholder,
      avatarPlaceholder,
    });
    const viewModel = sdk.createConversationViewModel();
    setConViewModel(viewModel);
    conViewModelRef.current = viewModel;
    sdkRef.current = sdk;
  };

  const initUser = async () => {
    await sdkRef.current?.initUser(constants.auid);
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
      // updateConstants(users[userIndex]);
      updateConstants(res);

      await onGetAuth();

      // init sdk
      // open DEBUG mode
      IMSdk.initLog(LogModeEnum.DEBUG);
      await initSdk();
      await initUser();
      setLoginStatus("success");
      // setAChatId("g_8d7828d2763f23bc");
    } catch (e: any) {
      console.log(e);
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
    const auids = auidChat.split(",").map((v) => v.trim());
    const chatId =
      auids.length === 1
        ? createSingleChatId(auids[0], constants.auid)
        : createGroupChatId(constants.auid);
    sdkRef.current?.createChat({
      aChatId: chatId,
      auids,
      chatName: "test",
      avatar: getImage(),
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

  const sendMessage = async () => {
    if (!aChatId) {
      message.info("please select a chat");
      return;
    }
    if (content.length === 0) {
      message.info("please input content");
      return;
    }
    setContent("");
    const amid = nanoid();
    sdkRef.current?.sendTextMessage({
      amid,
      content,
      aChatId,
      ...(quoteMsg && {
        quoteAmid: quoteMsg.amid,
      }),
    });
    if (quoteMsg) setQuoteMsg(undefined);
  };

  const getFileMessageAmid = () => {
    if (!aChatId) {
      message.info("please select a chat");
      return;
    }
    if (attachmentList.length === 0) {
      message.info("please select file");
      return;
    }
    return new Date().getTime().toString();
  };

  const sendAttachmentMessage = () => {
    const amid = getFileMessageAmid();
    if (!amid || !aChatId) return;

    sdkRef.current?.sendAttachmentMessage({
      data: attachmentList[0] as any,
      aChatId,
      amid,
    });
  };

  const sendVideoMessage = () => {
    const amid = getFileMessageAmid();
    if (!amid || !aChatId) return;

    sdkRef.current?.sendVideoMessage({
      data: attachmentList[0] as any,
      aChatId,
      amid,
    });
  };

  const sendImageMessage = () => {
    const amid = getFileMessageAmid();
    if (!amid || !aChatId) return;

    sdkRef.current?.sendImageMessage({
      data: attachmentList[0] as any,
      aChatId,
      amid,
      isOrigin: false,
    });
  };

  const logout = () => {
    sdkRef.current?.loginOut();
  };

  const getUnreadCount = async () => {
    const count = await conViewModel?.getUnReadCount();
    message.info(`unread count: ${count}`);
  };

  const renderBadgeText = (color: string, text: string) => {
    return (
      <Space>
        <Badge color={color} />
        <span>{text}</span>
      </Space>
    );
  };

  const openNewTab = (path: string) => {
    window.open(path, "_blank");
  };

  const renderUserAvatar = (info: CustomAvatarViewUserInfo, contentNode: React.ReactNode) => {
    return (
      <Popover
        content={
          <Card style={{ width: 200 }}>
            <Space direction="vertical" align="center">
              <img className={styles.avatar} src={info.avatar} alt="avatar" />
              <span>{info.name}</span>
            </Space>
          </Card>
        }
      >
        {contentNode}
      </Popover>
    );
  };

  const chatDelegate: ChatDelegate = {
    onButtonMessageClick: (amid, buttonId) => {
      const obj = JSON.parse(buttonId);
      if (obj.type === 19) {
        sdkRef.current?.disableCardMessage(amid, [buttonId]);
      }
      console.log("onButtonMessageClick", amid, buttonId);
    },
    onMiddleMessageClick: (amid, tmpId, buttonId) => {
      console.log("onMiddleMessageClick", amid, tmpId, buttonId);
    },
    onShowCustomMessageView: (amid, content) => {
      return (
        <div style={{ padding: 16, fontWeight: "bold" }}>
          <h2>CustomView:</h2>
          amid：{amid}，content：{content}
        </div>
      );
    },
    onRenderCustomAvatarView: renderUserAvatar,
    onRenderFriendRequestView: renderUserAvatar,
    onMessageForward: (amids) => {
      Modal.confirm({
        content: "确认转发？",
        onOk: () => {
          amids.forEach(async (amid) => {
            const res = await sdkRef.current?.sendForwardMessage({
              amid,
              forwardAMid: nanoid(),
              aChatId: "s_bb33385154069f3c_edc51147849861d9",
            });
            console.log("forward", res);
          });
        },
      });
    },
    onMessageQuote: (a, b, quoteMsg) => {
      setQuoteMsg(quoteMsg);
    },
    onMessageMultipleChooseClick: (chooser) => {
      multipleChooser.current = chooser;
    },
    onVideoPreview: openNewTab,
    onFilePreview: openNewTab,
    onMessageDownFile: console.log,
  };

  const onConversationItemClick = (aChatId: string) => {
    setAChatId(aChatId);
    sdkRef.current?.setGroupUserInfo(aChatId, [
      {
        isAdmin: 1,
        isOwner: 1,
        alias: "alias",
        deleted: true,
        auid: "23083334c27fd9e5",
        createTime: 13123123,
      },
    ]);
    console.log(aChatId);
  };

  const disableCardMessage = () => {
    sdkRef.current?.disableCardMessage("", [""]);
  };

  const ConversationView = useMemo(() => conViewModel?.getView(), [!!conViewModel]);

  const setFolder = () => {
    if (!aChatId) return;
    conViewModel?.setFolder({
      aChatId: "Not_Interesting",
      name: "Not Interesting",
      imageData: getImage(),
      content: "not interesting chats",
    });
    conViewModel?.updateSelector([], [aChatId]);
  };

  const removeFolder = () => {
    conViewModel?.removeFolder("Not_Interesting");
    conViewModel?.updateSelector([]);
  };

  const setConversationSubTitle = () => {
    aChatId &&
      sdkRef.current?.setConversationSubTitle({
        subTitles: [{ aChatId, subTitle: "my subTitle" }],
      });
  };

  const setConversationMarker = () => {
    aChatId &&
      sdkRef.current?.setConversationMarker({
        markers: [{ aChatId, icon: getImage() }],
      });
  };

  const setConversationMute = (isMute: boolean) => {
    aChatId &&
      conViewModel?.setChatMute({
        aChatId,
        isMute,
        onSuccess: () => {
          console.log("success");
        },
      });
  };

  const onAutoLoginChange = (auto: boolean) => {
    setAutoLogin(auto);
    if (auto) localStorage.setItem("autoLogin", "1");
    else localStorage.removeItem("autoLogin");
  };

  const getBtn = (body: string, onClick: () => void, buttonProps?: ButtonProps) => {
    return (
      <Button key={body} onClick={onClick} {...buttonProps}>
        {body}
      </Button>
    );
  };

  const tabs = [
    {
      title: "Base",
      items: [
        <Space key="Toggle Chat View Display">
          <Switch
            checked={isShowChatView}
            onChange={(v) => {
              setIsShowChatView(v);
              if (!v) setAChatId(undefined);
            }}
          />
          <span>Toggle Chat View Display</span>
        </Space>,
        <Space key="Auto Login">
          <Switch checked={autoLogin} onChange={onAutoLoginChange} />
          <span>Auto Login</span>
        </Space>,
        getBtn("Logout", logout),
        getBtn("Set Locale Zh", () => {
          sdkRef.current?.setCurrentLanguage("zh-CN");
        }),
        getBtn("Set Locale Tr", () => {
          sdkRef.current?.setCurrentLanguage("tr");
        }),
        getBtn("Set Locale En", () => {
          sdkRef.current?.setCurrentLanguage("en");
        }),
      ],
    },
    {
      title: "Chat",
      items: [
        <Uploader
          key="Choose File"
          fileList={attachmentList}
          onFileListChange={setAttachmentList}
        />,
        getBtn("Send Image", sendImageMessage),
        getBtn("Send Attachment", sendAttachmentMessage),
        getBtn("Send Video", sendVideoMessage),
        getBtn("Cancel Select", () => {
          multipleChooser.current?.onCancelMessageMultipleChoose();
        }),
        getBtn("Get Select Amids", () => {
          console.log(multipleChooser.current?.getSelectMessageAmids());
        }),
        getBtn("Get Can Forward Amids", () => {
          console.log(multipleChooser.current?.getCanForwardSelectMessageAmids());
        }),
        getBtn("Delete My Messages", () => {
          aChatId && sdkRef.current?.clearChatMessage(aChatId);
        }),
        getBtn("Revoke My Messages", () => {
          aChatId && sdkRef.current?.revokeMyMessage(aChatId);
        }),
        getBtn("Revoke Specified Messages", () => {
          sdkRef.current?.retractMessages(["hJ6bw2G7sj3iTiPGYfNhf", "MjR1_-eOyZXGBCFUZxCm8"]);
        }),
        getBtn("Show Chat", () => {
          sdkRef.current?.showChat("g_68449c182a86db3e");
        }),
        getBtn("Send Card Message", () => {
          sendCardMessage();
        }),
        getBtn("Send Notification Message", () => {
          sendNotificationMessage();
        }),
        getBtn("Send Customize Message", () => {
          sendCustomizeMessage();
        }),
        getBtn("Send Middle Message", () => {
          sendMiddleMessage();
        }),
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
        getBtn("Selector", () => {
          aChatId && conViewModel?.updateSelector([aChatId], []);
        }),
        getBtn("Selector All", () => {
          conViewModel?.updateSelector([], []);
        }),
        getBtn("Set Chat Top", () => {
          aChatId &&
            conViewModel?.setChatTop({
              aChatId,
              isTop: true,
              onSuccess: () => {
                console.log("success");
              },
            });
        }),
        getBtn("Set Chat Top False", () => {
          aChatId &&
            conViewModel?.setChatTop({
              aChatId,
              isTop: false,
              onSuccess: () => {
                console.log("success");
              },
            });
        }),
        getBtn("Get Chat Top", () => {
          aChatId &&
            conViewModel?.getChatIsTop({
              aChatId,
              callback: (isTop) => {
                console.log(isTop);
              },
            });
        }),
        getBtn("Scroll To Chat", () => {
          aChatId && conViewModel?.scrollToChat({ aChatId, hideJudge: true });
        }),
        getBtn("Clear", () => {
          setAChatId("");
        }),
      ],
    },
    {
      title: "UI Setting",
      items: [
        getBtn("Set Chat Background", () => {
          sdkRef.current?.setImUiSetting({
            chatBackground: "#333",
          });
        }),
        getBtn("Set Avatar Image Default", () => {
          sdkRef.current?.setImUiSetting({
            avatarPlaceholder: avatarPlaceholder,
          });
        }),
        getBtn("Set Chat List Image", () => {
          sdkRef.current?.setImUiSetting({
            chatImagePlaceholder,
          });
        }),
        getBtn("Filter Message Menus", () => {
          sdkRef.current?.setImUiSetting({
            menuTypesOfMessage: [
              IMMessageMenuType.COPY,
              IMMessageMenuType.REPLY,
              IMMessageMenuType.DELETE_FOR_ME,
            ],
          });
        }),
        getBtn("Toggle Left Avatar Displayed On The Single Chat", () => {
          sdkRef.current?.setImUiSetting({
            isShowLeftAvatarBySingleChat:
              !sdkRef.current.getImUiSetting().isShowLeftAvatarBySingleChat,
          });
        }),
        getBtn("Toggle Right Avatar Displayed", () => {
          sdkRef.current?.setImUiSetting({
            isShowRightAvatar: !sdkRef.current.getImUiSetting().isShowRightAvatar,
          });
        }),
      ],
    },
  ];

  const renderChatView = () => (
    <Provider>
      <Row style={{ height: 400 }}>
        <Col style={{ height: "100%" }}>
          {ConversationView && (
            <ConversationView
              style={{ width: 320 }}
              delegate={{
                onItemClick: onConversationItemClick,
                onReadCountChange({ unreadCount }) {
                  setCount(unreadCount);
                },
                onTagRender: (chatId) =>
                  ["g_tmmtmmpay", "g_tmmtmm"].includes(chatId) && (
                    <div
                      style={{
                        width: 26,
                        textAlign: "center",
                        background: "#f00",
                        color: "#fff",
                        borderRadius: 10,
                        lineHeight: "15px",
                        fontSize: "12px",
                        flexShrink: 0,
                      }}
                    >
                      vip
                    </div>
                  ),
              }}
            />
          )}
        </Col>
        <Col flex="1" style={{ height: "100%", width: 0 }}>
          <ChatViewWrapper
            chatId={aChatId}
            onChatIdChange={onChatIdChange}
            delegate={chatDelegate}
          />
        </Col>
      </Row>
    </Provider>
  );

  return (
    <div className={styles.app}>
      <Row gutter={24}>
        <Col flex={1}>
          <Card
            title="User Login"
            extra={
              <span>
                unread count:{" "}
                <Badge size="small" count={count} showZero color={count > 0 ? "red" : "#ccc"} />
              </span>
            }
          >
            {loginStatus === "loading" ? (
              <Space>
                login
                <Spin />
              </Space>
            ) : loginStatus === "success" ? (
              renderBadgeText("green", `login succeed, auid: ${constants.auid}`)
            ) : loginStatus === "fail" ? (
              renderBadgeText("red", "login failed")
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
                <InputNumber
                  style={{ width: 50 }}
                  min={0}
                  max={users.length - 1}
                  placeholder="user index"
                  value={userIndex}
                  onChange={(v) => setUserIndex(v ?? 0)}
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
                  placeholder="chat user auids, example: 'auid1,auid2'"
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
      <Card bodyStyle={{ padding: 0 }}>
        {isShowChatView && renderChatView()}
        <div style={{ padding: 24 }}>
          {quoteMsg && (
            <Row className={styles.quote}>
              <Col flex={1}>{JSON.stringify(quoteMsg.content)}</Col>
              <Col>
                <Button
                  size="small"
                  onClick={() => {
                    setQuoteMsg(undefined);
                  }}
                >
                  clear
                </Button>
              </Col>
            </Row>
          )}
          <Row gutter={24}>
            <Col flex={1}>
              <Input
                placeholder="message content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPressEnter={sendMessage}
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
              children: (
                <Space size={[12, 12]} wrap>
                  {items}
                </Space>
              ),
            }))}
          />
        </div>
      </Card>
    </div>
  );
};

const ChatViewWrapper = React.memo<ChatViewProps>(
  ({ chatId, onChatIdChange, delegate }) => {
    return <ChatView chatId={chatId} onChatIdChange={onChatIdChange} delegate={delegate} />;
  },
  (prev, next) => {
    if (prev.chatId !== next.chatId) return false;
    return true;
  }
);

export default App;
