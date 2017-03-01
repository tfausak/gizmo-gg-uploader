/* eslint-env browser */

'use strict';

const chokidar = require('chokidar');
const electron = require('electron');
const fs = require('fs');
const mithril = require('mithril');
const os = require('os');
const path = require('path');
const request = require('request');

const version = electron.remote.app.getVersion();
let replayDirectory = process.env.GIZMO_REPLAY_DIR;
const replayPattern = /\.replay$/i;
const gizmoUrl = process.env.GIZMO_API_URL || 'http://gizmo.gg/api/uploads';
const root = document.getElementById('root');

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

const state = {
  queue: [],
  replays: []
};

const pluralize = (number, word) => {
  if (number === 1) {
    return `${number} ${word}`;
  }

  return `${number} ${word}s`;
};

const Gizmo = {
  view: () => [
    mithril('h1', {class: 'header'}, [
      mithril('a', {href: '#'}, 'gizmo.gg'),
      ' uploader'
    ]),
    mithril('p', {class: 'info'}, [
      'Watching ', mithril('span', {class: 'watching'}, replayDirectory), '.',
      mithril('br'),
      'Waiting to upload ', pluralize(state.queue.length, 'replay'), '.',
      mithril('br'),
      'Uploaded ', pluralize(state.replays.length, 'replay'), '.'
    ]),
    mithril('ul', {class: 'replays'}, state.
      replays.
      slice(-3).
      reverse().
      map((replay) => mithril('li', {class: 'replay'}, [
        mithril('p', {class: 'name'},
          mithril('span', {title: `${replay.file}`},
            path.basename(replay.file, '.replay'))),
        mithril('p', {class: 'date'},
        mithril('span', {title: `${replay.date}`},
          replay.date.toLocaleString()))
      ])))
  ]
};

document.title = `gizmo.gg uploader ${version}`;
mithril.mount(root, Gizmo);

const onRequestDone = (file) => (error, response) => {
  if (error) {
    return;
  }

  if (response.statusCode !== 303) {
    return;
  }

  state.replays.push({
    date: new Date(),
    file
  });
  mithril.redraw();
};

const onFileAdd = (file) => {
  if (!replayPattern.test(file)) {
    return;
  }

  state.queue.push(file);
};

chokidar.watch(replayDirectory, {ignoreInitial: true}).on('add', onFileAdd);

const processQueue = () => {
  const file = state.queue.shift();

  if (!file) {
    return setTimeout(processQueue, 1000);
  }

  request.post({
    formData: {
      replay: {
        options: {filename: file},
        value: fs.createReadStream(file)
      }
    },
    url: gizmoUrl
  }, onRequestDone(file));

  return setTimeout(processQueue, 0);
};

processQueue();
