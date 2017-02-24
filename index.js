'use strict';

const electron = require('electron');
const path = require('path');
const url = require('url');

let window = null;

electron.app.on('ready', () => {
  window = new electron.BrowserWindow();
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  window.on('closed', () => {
    window = null;
  });
});

electron.app.on('window-all-closed', () => {
  electron.app.quit();
});
