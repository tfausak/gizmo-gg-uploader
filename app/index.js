/* eslint-env browser */

'use strict';

const chokidar = require('chokidar');
const electron = require('electron');
const os = require('os');
const path = require('path');

const version = electron.remote.app.getVersion();
let replayDirectory = process.env.GIZMO_REPLAY_DIR;
const replayPattern = /\.replay$/i;

if (!replayDirectory) {
  const home = os.homedir();
  const demos = path.join('Rocket League', 'TAGame', 'Demos');

  switch (os.platform()) {
  case 'darwin':
    replayDirectory = path.join(home, 'Library', 'Application Support', demos);
    break;
  case 'win32':
    replayDirectory = path.join(home, 'Documents', 'My Games', demos);
    break;
  default:
    replayDirectory = path.join(home, '.local', 'share', demos);
  }
}

document.title = `gizmo.gg uploader ${version}`;

chokidar.watch(replayDirectory, {ignoreInitial: true}).on('add', (file) => {
  if (!replayPattern.test(file)) {
    return;
  }
  console.log(file);
});
