/* eslint-env browser */

'use strict';

const chokidar = require('chokidar');
const electron = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('request');

const version = electron.remote.app.getVersion();
let replayDirectory = process.env.GIZMO_REPLAY_DIR;
const replayPattern = /\.replay$/i;
const gizmoUrl = process.env.GIZMO_API_URL || 'http://gizmo.gg/api/uploads';
const expectedStatusCode = 303;

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

const onRequestDone = (error, response, body) => {
  if (error) {
    console.error(error);

    return;
  }

  if (response.statusCode !== expectedStatusCode) {
    console.warn(response, body);

    return;
  }

  console.log(response, body);
};

const onFileAdd = (file) => {
  if (!replayPattern.test(file)) {
    return;
  }

  request.post({
    formData: {
      replay: {
        options: {filename: file},
        value: fs.createReadStream(file)
      }
    },
    url: gizmoUrl
  }, onRequestDone);
};

chokidar.watch(replayDirectory, {ignoreInitial: true}).on('add', onFileAdd);
