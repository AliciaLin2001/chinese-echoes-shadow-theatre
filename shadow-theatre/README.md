# Chinese Echoes · Shadow Theatre

A static classroom tool for ages 6–12: Chinese, pinyin, Belgian Dutch, French and English. No accounts, database or API keys.

## Run

Serve the parent directory with `python3 -m http.server 8773`, then open `/shadow-theatre/`.

- `videos.js`: full source stories, measured source-video timing, Chinese/pinyin/NL/EN/FR.
- `scripts-data.js`: original simplified rehearsal scripts, separate from video subtitles.
- `languages.js`: interface and script translations.
- `images/`: video cover references and story stills for rehearsal.
- `intro.html`: standalone shadow-puppetry introduction.

Subtitles are prepared in advance; they are not live speech recognition. All five stories start at 00:00 and play through the complete video. Captions cover narration and dialogue to each ending; the crow video also includes its opening and vocabulary review. Music/silent pauses may have no text. Captions stay below the video in normal and fullscreen playback. Full videos are not included in this repository or website.

For offline use, select the same full source MP4 through “打开本地视频”. The private offline classroom package can also provide `media/race.mp4`, `crow.mp4`, `farmer.mp4`, `fox.mp4`, `nezha.mp4`; open with `?offline=1`. Browser speech depends on installed voices; NL-BE is preferred with same-language fallback. Student ending notes stay in localStorage.

Pinyin follows word-based spelling and lexical tone marks; 一/不 are generally written in their original tone. Neutral tones remain unmarked. Natural speech includes tone changes. Reference: GB/T 16159—2012.

## Sources and licenses

The application code and original classroom scripts are MIT licensed (see LICENSE). Embedded videos, source subtitles/translations, video thumbnails, video stills, and publisher marks remain third-party material and are excluded from that license. Source video IDs and publishers appear in `videos.js`; do not treat an MIT code license as a license to redistribute full videos.

The introduction diagram is original SVG. General cultural reference: https://ich.unesco.org/en/RL/chinese-shadow-puppetry-00421

## Classroom activities

Each story has 10 original multiple-choice questions in a separate Quiz tab. The first two refer to the timed excerpt; the remaining questions cover the full story or adapted performance script. Feedback sounds are synthesized locally and can be muted. Fullscreen viewing includes subtitles below the video; stage pages show three dialogue lines per scene across five scenes with speaker portraits.

`classroom.html` offers date-based attendance, random selection without repetition, points, undo, and JSON backup/import. The public app ships with no student roster. Only names and attendance dates should be imported locally; no spreadsheet credentials, contact or health data are used. Scores remain in that browser and are not synced to Google Sheets.

Stage accompaniment is an original synthesized pentatonic loop (`music.js`), available offline, with six scores, volume control, speech ducking, and automatic stop on closing or hiding the page. `stage-scenes.js` adds original rehearsal lines and translations; they are not quotes from the videos. The narrator avatar was generated with the built-in image tool; the school seal is used only on this activity page and remains the school’s mark.

The introduction now uses the 34-second `Chinese Shadow Puppetry How-To (HD)` demonstration by NORULES CHANNEL (`emf2eon5suQ`). Its six multilingual cues are original action guidance aligned to the image, not a transcript of the source audio. Teacher notes are collapsed. The offline package also supports `media/intro.mp4`.

The rehearsal player offers six original short looping scores with distinct tempos and note patterns. Stage action cues are translated and each line can be read in Chinese or the selected auxiliary language.

Caption source editing: `tools/shadow-captions/*.txt` stores explicit reviewed times and Chinese/NL/EN/FR text. `build.py` generates word-spaced pinyin and `videos.js`. Tests in `tests/shadow-captions.test.js` exercise cue boundaries, backward seeking, gaps and language completeness. English speech in the crow opening is translated into Chinese; vocabulary cards follow their displayed times. The quiz still links its first two questions to the original evidence interval without limiting full-story playback.
