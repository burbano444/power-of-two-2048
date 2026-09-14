const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const HTML_PATH = path.join(__dirname, '..', 'index.html');
const HTML = fs.readFileSync(HTML_PATH, 'utf8');

function loadGame() {
  const dom = new JSDOM(HTML, {
    runScripts: 'dangerously',
    url: 'https://example.com/index.html'
  });
  const opened = [];
  dom.window.open = (url) => { opened.push(url); return null; };
  return { window: dom.window, document: dom.window.document, opened };
}

function click(el) {
  el.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
}

test('feedback modal starts hidden and opens on button click', () => {
  const { document } = loadGame();
  assert.equal(document.getElementById('feedbackModal').hidden, true);
  click(document.getElementById('feedbackBtn'));
  assert.equal(document.getElementById('feedbackModal').hidden, false);
});

test('sending empty feedback shows an error and does not open a tab', () => {
  const { document, opened } = loadGame();
  click(document.getElementById('feedbackBtn'));
  click(document.getElementById('feedbackSend'));
  assert.equal(opened.length, 0);
  assert.equal(document.getElementById('feedbackError').hidden, false);
  assert.equal(document.getElementById('feedbackModal').hidden, false);
});

test('whitespace-only feedback is treated as empty', () => {
  const { document, opened } = loadGame();
  click(document.getElementById('feedbackBtn'));
  document.getElementById('feedbackText').value = '   ';
  click(document.getElementById('feedbackSend'));
  assert.equal(opened.length, 0);
});

test('sending feedback opens a pre-filled GitHub issue in a new tab and closes the modal', () => {
  const { document, opened } = loadGame();
  click(document.getElementById('feedbackBtn'));
  document.getElementById('feedbackText').value = 'Please add a dark mode toggle';
  click(document.getElementById('feedbackSend'));

  assert.equal(opened.length, 1);
  const url = new URL(opened[0]);
  assert.equal(url.origin + url.pathname, 'https://github.com/burbano444/power-of-two-2048/issues/new');
  assert.equal(url.searchParams.get('body'), 'Please add a dark mode toggle');
  assert.equal(url.searchParams.get('labels'), 'feedback');
  assert.equal(document.getElementById('feedbackModal').hidden, true);
});

test('cancel closes the modal without sending anything', () => {
  const { document, opened } = loadGame();
  click(document.getElementById('feedbackBtn'));
  document.getElementById('feedbackText').value = 'abc';
  click(document.getElementById('feedbackCancel'));
  assert.equal(opened.length, 0);
  assert.equal(document.getElementById('feedbackModal').hidden, true);
});

test('clicking the backdrop closes the modal', () => {
  const { document } = loadGame();
  click(document.getElementById('feedbackBtn'));
  click(document.getElementById('feedbackModal'));
  assert.equal(document.getElementById('feedbackModal').hidden, true);
});

test('clicking inside the modal panel does not close it', () => {
  const { document } = loadGame();
  click(document.getElementById('feedbackBtn'));
  click(document.querySelector('#feedbackModal .modal-panel'));
  assert.equal(document.getElementById('feedbackModal').hidden, false);
});

test('Escape closes the feedback modal', () => {
  const { window, document } = loadGame();
  click(document.getElementById('feedbackBtn'));
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(document.getElementById('feedbackModal').hidden, true);
});

test('reopening the modal clears previous input and error state', () => {
  const { document } = loadGame();
  click(document.getElementById('feedbackBtn'));
  click(document.getElementById('feedbackSend')); // triggers the empty-input error
  assert.equal(document.getElementById('feedbackError').hidden, false);
  click(document.getElementById('feedbackCancel'));

  click(document.getElementById('feedbackBtn'));
  assert.equal(document.getElementById('feedbackText').value, '');
  assert.equal(document.getElementById('feedbackError').hidden, true);
});

test('game arrow keys move tiles when the feedback modal is closed', () => {
  const { window, document } = loadGame();
  assert.equal(document.getElementById('feedbackModal').hidden, true);
  const evt = new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
  window.dispatchEvent(evt);
  assert.equal(evt.defaultPrevented, true);
});

test('game arrow/WASD keys are ignored while the feedback modal is open, so typing still works', () => {
  const { window, document } = loadGame();
  click(document.getElementById('feedbackBtn'));
  const evt = new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
  window.dispatchEvent(evt);
  assert.equal(evt.defaultPrevented, false);
});
