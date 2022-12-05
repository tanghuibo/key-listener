const {
  app,
  globalShortcut,
  clipboard,
  BrowserWindow,
  ipcMain,
} = require("electron");

const fs = require("fs");

let dataList = null;
let dataIndex = 0;

const createWindow = () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.show();
  win.setSize(445, 560, false);
  win.loadFile("src/view/index.html");
  win.on("closed", () => app.quit());

  ipcMain.on("dataList", (event, data) => {
    dataList = data.split("\n");
    dataIndex = 0;
    clipboard.writeText(dataList[dataIndex]);
    win.webContents.send(
      "showData",
      JSON.stringify({
        preData: "",
        currentData: dataList[dataIndex],
      })
    );
  });

  globalShortcut.register("ctrl+e", () => {
    const cbTxt = clipboard.readText();
    dataList[dataIndex] = dataList[dataIndex] + ":" + cbTxt;
    fs.writeFileSync("d://result.txt", dataList.join("\n"));
    if (dataIndex < dataList.length - 1) {
      win.webContents.send(
        "showData",
        JSON.stringify({
          preData: dataList[dataIndex],
          currentData: dataList[dataIndex + 1],
        })
      );
      dataIndex++;
      clipboard.writeText(dataList[dataIndex]);
    } else {
      win.webContents.send("finish", dataList.join("\n"));
    }
  });
};

app.whenReady().then(() => {
  createWindow();
});

app.on("will-quit", function () {
  //注销全局快捷键的监听
  globalShortcut.unregisterAll();
});
