# House of Gamit

An interactive medieval-inspired family tree built with HTML, CSS, and JavaScript. No installation or build required.

## Run

Download the repository and open `index.html` in a modern browser. You can also run `python -m http.server 8000` from the project folder and visit http://localhost:8000.

## Features

- Add/edit people, parents, children, and spouses/partners; connect in-laws through marriage.
- Portrait uploads, biographies, occupations, home, birth/death dates, and living/deceased status.
- Pan/zoom tree, search, living/deceased filters, profile directory, and birth chronology.
- Custom house name and motto; JSON archive export/import.
- Validation against circular ancestry and inconsistent dates.

## Storage

This first version saves edits in the current browser using localStorage. It does not save family edits to GitHub or sync across devices. Export a JSON archive for backup. Different website addresses have separate browser storage. All sample people are fictional.

Shared database storage, authentication, family invitations, and viewer/editor roles are not implemented yet. Multiple spouse history and adoption relationship types are future enhancements.

## Hosting

Deploy the root `index.html` using any static host. GitHub Pages has not been enabled and repository visibility has not been changed. A private repository does not automatically make a hosted website private; configure hosting access separately.

The existing private prototype is https://gamit-house-chronicle.richcurry512.chatgpt.site . That deployment is separate and does not automatically update from GitHub commits.
