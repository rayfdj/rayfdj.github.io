/*
  Broadsheet margin notes: copy each footnote into an <aside> beside the block that cites it.
  CSS shows the asides only on wide screens and hides the endnotes list there, so each
  viewport exposes exactly one copy of every note. Without this script the endnotes stay as they are.
*/
(function () {
  'use strict';

  var prose = document.querySelector('.bs-prose');
  if (!prose || !prose.querySelector('[role="doc-endnotes"]')) return;

  var made = 0;

  prose.querySelectorAll('a[role="doc-noteref"][href^="#"]').forEach(function (ref) {
    var note = document.getElementById(decodeURIComponent(ref.getAttribute('href').slice(1)));
    if (!note) return;

    // The top-level block (paragraph, list, table...) that contains the reference.
    var block = ref;
    while (block.parentElement && block.parentElement !== prose) block = block.parentElement;
    if (block.parentElement !== prose) return;

    var aside = document.createElement('aside');
    aside.className = 'bs-sidenote';

    var copy = note.cloneNode(true);
    copy.querySelectorAll('.reversefootnote').forEach(function (backlink) { backlink.remove(); });
    copy.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
    while (copy.firstChild) aside.appendChild(copy.firstChild);

    // Number the note inline, at the start of its first paragraph.
    var number = document.createElement('span');
    number.className = 'bs-sidenote__num';
    number.textContent = ref.textContent;
    var first = aside.querySelector('p') || aside;
    first.insertBefore(number, first.firstChild);

    prose.insertBefore(aside, block);
    made++;
  });

  if (made) prose.classList.add('has-sidenotes');
})();
