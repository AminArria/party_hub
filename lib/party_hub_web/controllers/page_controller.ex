defmodule PartyHubWeb.PageController do
  use PartyHubWeb, :controller
  alias PartyHub.Parties

  def index(conn, _params) do
    rooms = Parties.get_recents()
    render(conn, "index.html", rooms: rooms)
  end
end
