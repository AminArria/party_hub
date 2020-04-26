defmodule PartyHub.PartiesTest do
  use PartyHub.DataCase

  alias PartyHub.Parties

  describe "rooms" do
    alias PartyHub.Parties.Room

    @valid_attrs %{name: "some name", twilio_room_id: "some twilio_room_id"}
    @update_attrs %{name: "some updated name", twilio_room_id: "some updated twilio_room_id"}
    @invalid_attrs %{name: nil, twilio_room_id: nil}

    def room_fixture(attrs \\ %{}) do
      {:ok, room} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Parties.create_room()

      room
    end

    test "list_rooms/0 returns all rooms" do
      room = room_fixture()
      assert Parties.list_rooms() == [room]
    end

    test "get_room!/1 returns the room with given id" do
      room = room_fixture()
      assert Parties.get_room!(room.id) == room
    end

    test "create_room/1 with valid data creates a room" do
      assert {:ok, %Room{} = room} = Parties.create_room(@valid_attrs)
      assert room.name == "some name"
      assert room.twilio_room_id == "some twilio_room_id"
    end

    test "create_room/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Parties.create_room(@invalid_attrs)
    end

    test "update_room/2 with valid data updates the room" do
      room = room_fixture()
      assert {:ok, %Room{} = room} = Parties.update_room(room, @update_attrs)
      assert room.name == "some updated name"
      assert room.twilio_room_id == "some updated twilio_room_id"
    end

    test "update_room/2 with invalid data returns error changeset" do
      room = room_fixture()
      assert {:error, %Ecto.Changeset{}} = Parties.update_room(room, @invalid_attrs)
      assert room == Parties.get_room!(room.id)
    end

    test "delete_room/1 deletes the room" do
      room = room_fixture()
      assert {:ok, %Room{}} = Parties.delete_room(room)
      assert_raise Ecto.NoResultsError, fn -> Parties.get_room!(room.id) end
    end

    test "change_room/1 returns a room changeset" do
      room = room_fixture()
      assert %Ecto.Changeset{} = Parties.change_room(room)
    end
  end
end
