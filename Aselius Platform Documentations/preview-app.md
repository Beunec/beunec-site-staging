# Aselius Preview App

`preview.aselius.beunec.com` is the public home for a deliverable you choose to publish:
a link you can hand to someone who has never signed into Aselius, that shows the file exactly as
it was produced, on any device.

## What shows exactly as generated

- **Word and PowerPoint** files render as the pages a real office suite would draw, not extracted
  text.
- **Excel and CSV** show as a grid, with the workbook's own fonts, fills, number formats, merges
  and charts. Not a spreadsheet described in prose, and not a PDF of it.
- **PDF, images, video and audio** play from the original file.
- **A saved Rivine Code project** publishes as a file tree and a read-only code viewer; secrets
  are scanned for and block the publish if found, with the exact file and line.
- Every published page carries a **Download** button for the original file.

## Access

A publication defaults to **code access**: anyone with the link you share opens it in one tap (the
access code travels in the link itself, after a `#`, which a browser never sends to a server), and
anyone with only the bare address is asked to enter the code. You can also set a page **Open**
(no code) or **Members only** (opens only from inside Aselius, for people in your workspace).
Rotating a publication's code invalidates every older link immediately.

## Theme and language

The preview site follows System, Light or Dark, the same choice as the Aselius web app, stored
per viewer, with a switch in the page header. A language switch next to it translates the page
into any of the languages Google Translate supports; a visitor's country picks a sensible starting
language, and their own choice always wins. Code, file names and product names are never
translated.

## Publishing from the Workspace

Any deliverable in your Taskspace, a Rivine engine's output or a saved Code project, gets a
**Publish** button in the Preview Panel. Publishing never changes the original asset in your
workspace; it is a snapshot, and a later edit stays private until you publish again.
