# PartyHub

## Requirements

- Elixir 1.10.2 (with Erlang/OTP 22)
- Docker and docker-compose

## Setup

1. Set the following environment variables:
    - **TWILIO_ACCOUNT_SID**
    - **TWILIO_AUTH_TOKEN**
    - **TWILIO_API_KEY**
    - **TWILIO_API_SECRET**
1. Start database with `docker-compose up`
1. Setup the project with `mix setup`

## Running (dev environment)

Start Phoenix either with `mix phx.server` or `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.
