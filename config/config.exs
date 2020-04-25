# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :party_hub,
  ecto_repos: [PartyHub.Repo]

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
