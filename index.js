'use strict';

const electron = require('electron');
const path = require('path');
const updater = require('electron-updater');
const url = require('url');

let mainWindow = null;

electron.app.on('ready', () => {
  mainWindow = new electron.BrowserWindow();

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

electron.app.on('window-all-closed', () => {
  electron.app.quit();
});

updater.autoUpdater.on('update-downloaded', () => {
  updater.autoUpdater.quitAndInstall();
});
updater.autoUpdater.checkForUpdates();
