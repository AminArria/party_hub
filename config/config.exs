# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

# Twilio API credentials
account_sid = System.get_env("TWILIO_ACCOUNT_SID") || raise "environment variable TWILIO_ACCOUNT_SID is missing."
auth_token = System.get_env("TWILIO_AUTH_TOKEN") || raise "environment variable TWILIO_AUTH_TOKEN is missing."
api_key = System.get_env("TWILIO_API_KEY") || raise "environment variable TWILIO_API_KEY is missing."
api_secret = System.get_env("TWILIO_API_SECRET") || raise "environment variable TWILIO_API_SECRET is missing."

# App config
config :party_hub,
  ecto_repos: [PartyHub.Repo],
  account_sid: account_sid,
  auth_token: auth_token,
  api_key: api_key,
  api_secret: api_secret

# Basic Auth
config :party_hub, :basic_auth,
  username: System.get_env("BASIC_AUTH_USER"),
  password: System.get_env("BASIC_AUTH_PASS")

# Configures Ecto migrations
config :party_hub, PartyHub.Repo,
  migration_timestamps: [type: :timestamptz]

# Configures the endpoint
config :party_hub, PartyHubWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "cbl10+yAk19Q8UnmhG3XSQ8tvDb6B7nXqSv3Hk48oDSDJDK5/G342yTcqc9nvp5B",
  render_errors: [view: PartyHubWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: PartyHub.PubSub,
  live_view: [signing_salt: "rWtGUrbV"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
