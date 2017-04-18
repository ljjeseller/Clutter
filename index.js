import { app, BrowserWindow, autoUpdater, dialog } from 'electron';
if(require('electron-squirrel-startup')) app.quit();

const os = require('os');
const path = require('path');
import { version } from '../../package.json';

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:${require('../../../config').port}`
    : `file://${__dirname}/index.html`;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 800,
        width: 1200,
        webPreferences: {
            webSecurity: false,
        },
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    //     // Set the save path, making Electron not to prompt a save dialog.
    //
    //     const filePath = path.join(os.homedir(), item.getFilename());
    //
    //     console.log(filePath);
    //     item.setSavePath(filePath);
    //
    //     item.on('updated', (event, state) => {
    //         if (state === 'interrupted') {
    //             console.log('Download is interrupted but can be resumed');
    //         } else if (state === 'progressing') {
    //             if (item.isPaused()) {
    //                 console.log('Download is paused');
    //             } else {
    //                 mainWindow.webContents.send('asynchronous-reply', item.getReceivedBytes());
    //                 console.log(`Received bytes: ${item.getReceivedBytes()}`);
    //             }
    //         }
    //     });
    //     item.once('done', (event, state) => {
    //         if (state === 'completed') {
    //             console.log('Download successfully');
    //         } else {
    //             console.log(`Download failed: ${state}`);
    //         }
    //     });
    // });


    const platform = os.platform();
    const arch = os.arch();
    let updatePlatform = '';

    if (platform === 'win32') {
        if (arch === 'x64') {
            updatePlatform = 'win64'
        } else {
            updatePlatform = 'win32'
        }
    } else if (platform === 'darwin') {
        updatePlatform = 'darwin_64'
    }

    console.log(platform);
    console.log(version);

    // eslint-disable-next-line no-console
    console.log('mainWindow opened');

    if (process.env.NODE_ENV === 'production') {
        autoUpdater.on('update-downloaded', () => {
            dialog.showMessageBox(mainWindow, {
                message : '更新已经下载完毕，点击确定自动更新',
            }, () => {
                autoUpdater.quitAndInstall();
            });
        });

        autoUpdater.setFeedURL(`http://192.168.1.34/update/${updatePlatform}/${version}/stable/`);

        mainWindow.webContents.once("did-frame-finish-load", () => {
            autoUpdater.checkForUpdates();
        })
    }

}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
