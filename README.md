# PartyHub

## About

PartyHub is a video sharing app designed for parties. You can join any ongoing party or start it yourself, you can choose to share your video, and you can choose who to watch.

Fill free to try the [DEMO](https://party-hub.herokuapp.com/) while credits last.

### What to expect on the future

This are a couple of features on the roadmap that will improve the party experience, but sadly for time constraints (yeah, my bad) haven't been implemented:

- Group chat with selected people
- Automatic DJ substitution
- private parties

## Requirements

- Elixir 1.10.2 (with Erlang/OTP 22)
- Docker and docker-compose
- A Twilio account and API key/secret - [sign up](https://www.twilio.com/try-twilio)

**Note**: If you plan on deploying this remember to use HTTPS or otherwise browsers won't allow media features.

## Setup

1. Set the following environment variables ([check Twilio's console](https://www.twilio.com/console)):
    - **TWILIO_ACCOUNT_SID**
    - **TWILIO_AUTH_TOKEN**
    - **TWILIO_API_KEY**
    - **TWILIO_API_SECRET**
1. Start database with `docker-compose up`
1. Setup the project with `mix setup`

## Running (dev environment)

Start Phoenix either with `mix phx.server` or `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## License

[MIT](/LICENSE)
