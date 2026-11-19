# Your media goes here

The files already here are used as-is:

- `music1.m4a` — first romantic music
- `recording.m4a` — your actual recorded voice
- `music-2.m4a` — cake celebration music
- `background.mp3` — quiet background music for the scenes without their own soundtrack

The app also accepts these deploy names: `music1.mp3`, `voice-message.mp3`, `music-2.mp3`, and `background.mp3` (or `.wav` / `.m4a` / `.ogg`), plus `photo-1.jpg` … `photo-6.jpg` for optional photographs (`.png` / `.webp` also work). For a music slot, a file named `music1.m4a` is preferred over `music1.mp3`, so keep the name you ship in that order.

Keep audio in a real MP4/M4A or MP3 container (a plain `.mp3` file with an `.m4a` name, or vice versa, may not play on every phone).

The app never generates music or a voice. If a file is absent, that moment degrades gracefully.

You can also use the in-app setup studio at `/#studio` to upload and preview on your own device, then download each file with the deploy name above.
