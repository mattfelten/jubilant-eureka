# Take-Home Challenge: “Log Viewer Lite”
![log-viewer-lite](https://github.com/user-attachments/assets/62e0ee91-33aa-4fa0-b5d2-ad8de9eb2f3d)

## Context
You’re working on a cloud-based developer console. One of the upcoming features is a 
lightweight log viewer for Kafka topics. The goal is to help developers quickly 
inspect recent logs/messages from a given topic, which is particularly useful 
when debugging issues.

We’ve already set up a simple backend ConnectRPC API that lets you:

- Fetch records from a topic, starting from a given offset.
- You can only read forwards (i.e., you cannot seek backward).
- It returns records in batches.

Your task is to design and implement a minimal end-to-end prototype of this feature,
from frontend to backend integration.

## What we're looking for
We want to see how you approach building a real feature for production. Focus on:

- User experience
- Code clarity
- Reasonable abstractions
- Tradeoffs and handling edge cases that may happen
- How you communicate what’s missing or where you’d extend

You’ll be provided with:
- A simple [ConnectRPC](https://connectrpc.com/) backend endpoint to consume messages.
- A base frontend app (React/TypeScript) that streams the records.

You may use whatever tools you like, but stick to basic dependencies where 
possible (e.g., don’t add a full design system or UI library unless justified).

## Deliverables
- A working solution (frontend + integration with provided API).
- A short (~1 page) design write-up covering:
  - How you approached the problem.
  - Any assumptions or simplifications you made.
  - What you’d improve or extend with more time.
  - Anything you’d want to discuss during the interview.

## Time expectation
We expect this to take around 3–5 hours. Don’t go overboard.
We’re more interested in how you think, not how polished it is.

## How we’ll use this
This is a conversation starter. During the interview, we’ll dig 
deeper into your decisions, explore how you might scale or 
generalize the solution, and look at how you think about design 
under constraints.

## Optional Extensions
- Search or filter logs
- Stream logs live (think "tail" mode)
- Persist user position in the topic

## Prerequisites

We use [Taskfile](https://taskfile.dev/) as our task runner. To get started:

1. Install Taskfile on your machine.
2. From the project root, run:

 ```bash
 task backend:start
```

This will:

1. Download the Go runtime into a build directory.
2. Launch the backend service, sedocs: rving the API at 0.0.0.0:8080.
