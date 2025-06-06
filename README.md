## LLM-Native Flight Scheduler Prototype

Link: https://flight-tracker-ft2c83v8m-bobbybeckers-projects.vercel.app/

GitHub: https://github.com/ogreowl/flight-tracker

## Prompt:
“Build something you think would be useful for a Part 135 Charter operator flying 2–3 Gulfstream 550 aircraft. This doesn't need to be novel or huge in scope—but should be something they would find useful. You should plan on spending no more than 3 hours on this and are highly encouraged to use code-gen tools like Cursor or Windsurf. Please refrain from using tools like V0, Replit, or Lovable.”

## Overview:
Much like products such as Motion AI and Cursor, my prototype combines the core features of a traditional software (flight scheduling) with an additional AI layer (LLMs). In the “traditional layer” of the prototype, the current flight schedule of the ‘operator’ is displayed in a user interface; they can add, edit, or delete flights, get real-time weather forecasts with the OpenWeatherMap API, and see warnings which are detected with hard-coded rules. In the additional “AI layer”, the user can talk to an LLM with access to their schedule and all previous changes. The LLM, gpt-4o, can also make function calls, allowing it to change the user’s schedule autonomously (add, edit & delete) or access additional information (such as by calling the Weather API or the Warning Detection Function for itself).

This is meant to demonstrate the core implementation of what has become a new paradigm in software development. With additional agentic features and more sophisticated implementations, this could become a “co-pilot” (pun unintended) for flight operators. For example, additional APIs, such as those related to traffic monitoring, could be implemented; or, the user could give vaguer commands, to which the AI would propose a potential solution (re-design the schedule in two weeks to account for the weather). In a more developed implementation, a version control would keep track of each change, minimizing the dangers of unintended AI behavior. 

## Tools & Frameworks:
SDKs: Next.js, React, Node.js, Tailwind CSS, Axios, Typescript

APIs: OpenWeatherMap API, OpenAI gpt-4o

Built with Cursor, Deployed with Vercel

