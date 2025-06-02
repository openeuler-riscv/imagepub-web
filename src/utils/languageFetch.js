import emitter from "@/utils/eventBus";
const requestMap = new Map();
export function languageFetch(uri) {
  const response = fetch(uri);
  const subscribers = [];
  requestMap.set(uri.replace('zh_CN','lange').replace('en_US','lange'),subscribers)
  // 创建一个可被多次订阅的对象
  const observable = {
    // 添加订阅者
    then: (callback) => {
      subscribers.push(callback);
      return observable;
    },
    // 错误处理
    catch: (errorCallback) => {
      response.catch(errorCallback);
      return observable;
    },
    // 手动触发所有订阅者
    notify: (data) => {
      subscribers.forEach(subscriber => subscriber(data));
    }
  };

  // 处理原始响应
  response.then((res) => {
    // 通知所有订阅者
    subscribers.forEach(subscriber => subscriber(res));
    // 保存响应以便后续订阅者也能收到
    observable.lastResponse = res;
  }).catch((error) => {
    console.error("语言请求错误:", error);
  });

  return observable;
}

// 语言变更监听
emitter.on("languageChanged", (newLang) => {
  console.log("languageChanged", newLang);
  requestMap.forEach((subscribers, uri) => {
    const response = fetch(uri.replace('lange',newLang));
    response.then((res) => {
      subscribers.forEach(subscriber => subscriber(res));
    });
  });
});
