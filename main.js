const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');

if (os.platform() == "win32") {
    if (!fs.existsSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher")) {
        fs.mkdirSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher");
    }
    if (!fs.existsSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings")) {
        fs.mkdirSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings");
    }
    if (!fs.existsSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\icons")) {
        fs.mkdirSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\icons");
    }
    if (!fs.existsSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings\\games.json")) {
        fs.writeFileSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings\\games.json", "[]");
    }
    if (!fs.existsSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings\\last.json")) {
        fs.writeFileSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings\\last.json", "{}");
    }
    if (!fs.existsSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings\\times.json")) {
        fs.writeFileSync(os.userInfo().homedir + "\\AppData\\Roaming\\game-launcher\\settings\\times.json", "[]");
    }
} else {
    if (!fs.existsSync(os.userInfo().homedir + "/.config/game-launcher")) {
        fs.mkdirSync(os.userInfo().homedir + "/.config/game-launcher");
    }
    if (!fs.existsSync(os.userInfo().homedir + "/.config/game-launcher/settings")) {
        fs.mkdirSync(os.userInfo().homedir + "/.config/game-launcher/settings");
    }
    if (!fs.existsSync(os.userInfo().homedir + "/.config/game-launcher/icons")) {
        fs.mkdirSync(os.userInfo().homedir + "/.config/game-launcher/icons");
    }
    if (!fs.existsSync(os.userInfo().homedir + "/.config/game-launcher/settings/times.json")) {
        fs.writeFileSync(os.userInfo().homedir + "/.config/game-launcher/settings/times.json", "[]");
    }
    if (!fs.existsSync(os.userInfo().homedir + "/.config/game-launcher/settings/games.json")) {
        fs.writeFileSync(os.userInfo().homedir + "/.config/game-launcher/settings/games.json", "[]");
    }
    if (!fs.existsSync(os.userInfo().homedir + "/.config/game-launcher/settings/last.json")) {
        fs.writeFileSync(os.userInfo().homedir + "/.config/game-launcher/settings/last.json", "{}");
    }
}

function createWindow () {
    const win = new BrowserWindow({
      width: 800,
        height: 600,
        title: "Game Launcher",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        icon: "./logo.png"
    })

    win.loadFile('content/index.html');
    win.setMenu(null);
    win.hide();
    win.maximize();

    // DEBUG ONLY
    //win.openDevTools();
}

app.whenReady().then(createWindow)
