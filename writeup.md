# How I approached the exercise

With 3–5 hours to work on this, I tried to be as efficient as I could with the time and information I had available. I used ChatGPT and Cursor to help me along the way. There's not a ton of tests but I made sure the ones existing continued to pass.

## Setup, Project Familiarization, and Plan (20m)

While installing Bun, Taskfile, dependencies, and getting the repo working locally, I also spent time researching the prompt and seeing what other tools exist for this purpose. I quickly looked at Kibana, Lenses.io, and DataDog which all have some features around log & topic viewing.

I also asked Cursor to give me a list of UX challenges I should consider while doing this. With more time, I would have talked with acquaintances I know that spend time deep in logs to understand their workflows a little more.

Some assumptions I made about the project were:

-   The API looks to be sending static JSON from `backend/service/log/logs` so I opted to not try to adjust what is being sent. Solve problems based on the data I have in front of me.
-   The frontend seems to be working well and I liked the decisions already made around starting/stoping the stream and the topic dropdown.
-   This role is for a Design Engineer so it probably makes sense to focus on the UX of the current UI.

With those things in mind, I prioritized a few aspects:

-   Basic Log Display
-   Copy to Clipboard
-   Filtering

## Basic Log Display (2h)

The log column was pushing the table really wide, so I added truncation via CSS to keep the table readable without horizontal scrolling. It's not perfect, most browsers will still show the full column content on hover, but better than before.

Since most logs included a `level` key, I parsed the log column to extract it, along with message if available. I added color and icons to visually separate `INFO`, `WARN`, `ERROR`, and `DEBUG` logs so users could scan more easily.

### With more time

-   Some logs couldn’t be parsed or weren’t objects. I’d explore cleaning those up.
-   I stripped additional keys from logs. I’d like to revisit how to display that data, either add more to each table row, or maybe in a drawer or panel.
-   `latency` seems useful. Could be shown as a badge next to the timestamp.

## Copy to Clipboard (30m)

To make truncated or incomplete logs easier to work with, I added a copy-to-clipboard feature. It’s in a dropdown per row, with a Toast confirmation using Shadcn. This also sets up a pattern for future row-level actions.

### With more time

-   I'm curious what other actions might be useful. Maybe a "notify me if this happens again" flag.

## Filtering (2h)

Building on the extracted `level`, I added the ability to filter logs by that value even as new logs stream in. To do this, I refactored the log parsing logic and how logs are stored in state so everything could be filtered consistently. This also allowed me to update the footer count accurately as well.

### With more time

-   I might revisit the filtering approach. Instead of hardcoding keys, filters could be dynamic based on any available log keys. Filtering on `partition_id` or `model` could be nice.
-   Logs that don't have a `level` are only visible when All logs has been selected. I wondered if I need to make a 5th level status like `UNKOWN` or something.

## Write-up (40m)

This write-up pushed me just over the 5-hour mark. Hopefully it’s helpful!

---

## Longer term ideas

-   **Virtualization**: With thousands of logs streaming in, virtualization will likely be necessary. Since the project already uses Tanstack, it might make sense to swap in Tanstack Table with virtualization support.
-   **Linking to logs**: Being able to deep link to a specific log by ID or timestamp could be handy for sharing context across teams.
-   **Grouping/collapsing**: If users often get flooded with similar logs, there may be value in collapsing or grouping by shared traits.
-   **Testing**: I intentionally de-prioritized tests for this prototype, but would want to leave things in a more test-covered state in a real project.
