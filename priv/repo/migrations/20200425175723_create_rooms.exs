defmodule PartyHub.Repo.Migrations.CreateRooms do
  use Ecto.Migration

  def change do
    create table(:rooms) do
      add :name, :string
      add :twilio_room_id, :string

      timestamps()
    end

  end
end
