import md5 from "md5";

/** create md5 16 */
export const getMd5 = (prefix: string, suffix: string): string => {
  let timeStamp = window.performance ? window.performance.now() : Date.now();
  // 6位随机数
  const random = [...new Array(6)].map(() => Math.floor(Math.random() * 10)).join("");

  return md5(`${prefix}${timeStamp}${random}${suffix}`).slice(8, 24);
};

/** create single chat id */
export const createSingleChatId = (userId1: string, userId2: string) => {
  const str = [userId1, userId2].sort().join("_");
  return `s_${str}`;
};

/** create session chat Id */
export const createGroupChatId = (uid: string) => {
  const md5Str = getMd5(uid, "group");
  return `g_${md5Str}`;
};
