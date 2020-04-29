defmodule PartyHub.Parties.Room do
  use PartyHub.Schema
  import Ecto.Changeset

  schema "rooms" do
    field :name, :string, null: false
    field :twilio_room_id, :string, null: false
    field :description, :string

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:name, :description])
    |> generate_twilio_room_id
    |> validate_required([:name, :twilio_room_id])
  end

  def generate_twilio_room_id(changeset) do
    uuid = Ecto.UUID.generate()
    put_change(changeset, :twilio_room_id, uuid)
  end
end
