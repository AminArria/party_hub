defmodule PartyHubWeb.RoomController do
  use PartyHubWeb, :controller

  alias PartyHub.Parties
  alias PartyHub.Parties.Room

  def index(conn, _params) do
    rooms = Parties.list_rooms()
    render(conn, "index.html", rooms: rooms)
  end

  def new(conn, _params) do
    changeset = Parties.change_room(%Room{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"room" => room_params}) do
    case Parties.create_room(room_params) do
      {:ok, room} ->
        # TODO: Disable client room creation and instead create them on-demand with
        # something like this, but probably not here
        # HTTPoison.post(
        #   "https://video.twilio.com/v1/Rooms",
        #   {:form, [{"Type", "group"}, {"UniqueName", room.twilio_room_id}]},
        #   [],
        #   [hackney: [basic_auth: {Application.get_env(:party_hub, :account_sid), Application.get_env(:party_hub, :auth_token)}]]
        # )
        conn
        |> put_flash(:info, "Room created successfully.")
        |> redirect(to: Routes.room_path(conn, :show, room))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    room = Parties.get_room!(id)
    render(conn, "show.html", room: room)
  end

  def edit(conn, %{"id" => id}) do
    room = Parties.get_room!(id)
    changeset = Parties.change_room(room)
    render(conn, "edit.html", room: room, changeset: changeset)
  end

  def update(conn, %{"id" => id, "room" => room_params}) do
    room = Parties.get_room!(id)

    case Parties.update_room(room, room_params) do
      {:ok, room} ->
        conn
        |> put_flash(:info, "Room updated successfully.")
        |> redirect(to: Routes.room_path(conn, :show, room))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", room: room, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    room = Parties.get_room!(id)
    {:ok, _room} = Parties.delete_room(room)

    conn
    |> put_flash(:info, "Room deleted successfully.")
    |> redirect(to: Routes.room_path(conn, :index))
  end

  def join(conn, %{"id" => id, "user" => %{"name" => name}}) do
    # TODO: horrible way to make unique identifiers, but it works.
    # On the fron-end we can just remove everything after the last
    # ocurrance of '_' to present the actual name given by the user
    timestamp = DateTime.utc_now |> DateTime.to_unix
    identity = "#{name}_#{timestamp}"

    room = Parties.get_room!(id)

    jwt =
      ExTwilio.JWT.AccessToken.new(
        account_sid: Application.get_env(:party_hub, :account_sid),
        api_key: Application.get_env(:party_hub, :api_key),
        api_secret: Application.get_env(:party_hub, :api_secret),
        identity: identity,
        expires_in: 14_400,
        grants: [ExTwilio.JWT.AccessToken.VideoGrant.new(room: room.twilio_room_id)]
      )
      |> ExTwilio.JWT.AccessToken.to_jwt!

    redirect(conn, to: Routes.room_path(conn, :party, room.id, room_name: room.twilio_room_id, identity: identity, token: jwt))
  end

  def party(conn, %{"id" => id, "token" => token}) do
    room = Parties.get_room!(id)
    render(conn, :party, room: room, jwt: token)
  end

  def subscribe_dj(conn, %{"room_name" => room_name, "user" => user}) do
    # TODO: Abstract this calls to its own module
    # TODO: check if there was an error with this request
    HTTPoison.post(
      "https://video.twilio.com/v1/Rooms/#{room_name}/Participants/#{user}/SubscribeRules",
      {:form, [{"Rules", "[{\"type\": \"include\", \"track\": \"dj_audio\"},{\"type\": \"include\", \"track\": \"dj_video\"}]"}]},
      [],
      [hackney: [basic_auth: {Application.get_env(:party_hub, :account_sid), Application.get_env(:party_hub, :auth_token)}]]
    )

    conn
    |> put_status(200)
    |> json(%{})
  end
end
