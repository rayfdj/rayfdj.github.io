/*
  Code blocks: a copy button in each block's header strip, and marked lines.
  Mark lines with {: data-mark-lines="2 4-6"} on the line after a fenced block,
  or with mark_lines="2 4" on a {% highlight %} tag.
*/
(function () {
  'use strict';

  var blocks = document.querySelectorAll('.bs-prose div.highlighter-rouge, .bs-prose figure.highlight');

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(area);
      if (ok) { resolve(); } else { reject(new Error('copy failed')); }
    });
  }

  function parseLines(spec) {
    var lines = [];
    (spec || '').split(/[\s,]+/).forEach(function (part) {
      var range = part.split('-').map(Number);
      if (!range[0]) return;
      for (var n = range[0]; n <= (range[1] || range[0]); n++) lines.push(n);
    });
    return lines;
  }

  blocks.forEach(function (block) {
    var pre = block.querySelector('pre');
    var code = block.querySelector('td.rouge-code pre') || block.querySelector('pre code') || pre;
    if (!pre || !code) return;
    pre = code.tagName === 'PRE' ? code : code.closest('pre');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'bs-code-copy';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.addEventListener('click', function () {
      copyText(code.innerText.replace(/\n$/, '')).then(function () {
        button.textContent = 'Copied';
        button.classList.add('is-copied');
        clearTimeout(button.resetTimer);
        button.resetTimer = setTimeout(function () {
          button.textContent = 'Copy';
          button.classList.remove('is-copied');
        }, 1600);
      }, function () {
        button.textContent = 'Press Ctrl+C';
      });
    });
    block.appendChild(button);

    // Marked lines: from data-mark-lines, or from the .hll spans Rouge emits for mark_lines.
    var marked = parseLines(block.getAttribute('data-mark-lines'));
    block.querySelectorAll('.hll').forEach(function (hll) {
      var before = document.createRange();
      before.setStart(code, 0);
      before.setEndBefore(hll);
      marked.push((before.toString().match(/\n/g) || []).length + 1);
    });
    if (!marked.length) return;

    var style = getComputedStyle(pre);
    var lineHeight = parseFloat(style.lineHeight);
    var top = parseFloat(style.paddingTop);
    marked.forEach(function (line) {
      var band = document.createElement('span');
      band.className = 'bs-code-mark';
      band.setAttribute('aria-hidden', 'true');
      band.style.top = (top + (line - 1) * lineHeight) + 'px';
      band.style.height = lineHeight + 'px';
      pre.appendChild(band);
    });
  });
})();
