defmodule PartyHub.Repo do
  use Ecto.Repo,
    otp_app: :party_hub,
    adapter: Ecto.Adapters.Postgres
end
