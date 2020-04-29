defmodule PartyHub.Schema do
  defmacro __using__(_) do
    quote do
      use Ecto.Schema
      import Ecto.Changeset
      @timestamps_opts [type: :utc_datetime]
    end
  end
end
