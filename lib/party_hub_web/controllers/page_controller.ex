defmodule PartyHubWeb.PageController do
  use PartyHubWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
