defmodule PartyHub.Repo.Migrations.PartyDescription do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      add :description, :string
    end
  end
end
