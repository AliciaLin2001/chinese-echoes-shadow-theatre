# Chinese Echoes · Shadow Theatre

A static classroom tool for ages 6–12: Chinese, pinyin, Belgian Dutch, French and English. No accounts, database or API keys.

## Run

Serve the parent directory with `python3 -m http.server 8773`, then open `/shadow-theatre/`.

- `videos.js`: selected short excerpts, exact source-video timing, Chinese/pinyin/NL/EN/FR.
- `scripts-data.js`: original simplified rehearsal scripts, separate from video subtitles.
- `languages.js`: interface and script translations.
- `images/`: video cover references and story stills for rehearsal.
- `intro.html`: standalone shadow-puppetry introduction.

Subtitles are prepared in advance; they are not live speech recognition. The default player stops at the selected excerpt's end. A separate link opens the complete source story. Full videos are not included in this repository or website.

For offline use, select the same full source MP4 through “打开本地视频”. The private offline classroom package can also provide `media/race.mp4`, `crow.mp4`, `farmer.mp4`, `fox.mp4`, `nezha.mp4`; open with `?offline=1`. Browser speech depends on installed voices; NL-BE is preferred with same-language fallback. Student ending notes stay in localStorage.

Pinyin follows word-based spelling and lexical tone marks; 一/不 are generally written in their original tone. Neutral tones remain unmarked. Natural speech includes tone changes. Reference: GB/T 16159—2012.

## Sources and licenses

The application code and original classroom scripts are MIT licensed (see LICENSE). Embedded videos, short quoted subtitles/translations, video thumbnails, video stills, and publisher marks remain third-party material and are excluded from that license. Source video IDs and publishers appear in `videos.js`; do not treat an MIT code license as a license to redistribute full videos.

The introduction diagram is original SVG. General cultural reference: https://ich.unesco.org/en/RL/chinese-shadow-puppetry-00421

## Classroom activities

Each story has 10 original multiple-choice questions in a separate Quiz tab. The first two refer to the timed excerpt; the remaining questions cover the full story or adapted performance script. Feedback sounds are synthesized locally and can be muted. Fullscreen viewing includes subtitles below the video; stage pages show up to four dialogue lines with speaker portraits.

`classroom.html` offers date-based attendance, random selection without repetition, points, undo, and JSON backup/import. The public app ships with no student roster. Only names and attendance dates should be imported locally; no spreadsheet credentials, contact or health data are used. Scores remain in that browser and are not synced to Google Sheets.
