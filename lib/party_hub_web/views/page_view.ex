defmodule PartyHubWeb.PageView do
  use PartyHubWeb, :view

  def time_ago(timestamp) do
    diff = DateTime.diff(DateTime.utc_now, timestamp)
    case to_greatest_unit(diff, :second) do
      {:second, amount} -> "#{amount} seconds"
      {:minute, amount} -> "#{amount} minutes"
      {:hour, amount} -> "#{amount} hours"
      {:day, amount} -> "#{amount} days"
    end
  end

  defp to_greatest_unit(0, _) do
    :previous_unit
  end
  defp to_greatest_unit(amount, :second) do
    new_amount = div(amount, 60)
    case to_greatest_unit(new_amount, :minute) do
      :previous_unit -> {:second, amount}
      result -> result
    end
  end
  defp to_greatest_unit(amount, :minute) do
    new_amount = div(amount, 60)
    case to_greatest_unit(new_amount, :hour) do
      :previous_unit -> {:minute, amount}
      result -> result
    end
  end
  defp to_greatest_unit(amount, :hour) do
    new_amount = div(amount, 24)
    case to_greatest_unit(new_amount, :day) do
      :previous_unit -> {:hour, amount}
      result -> result
    end
  end
  defp to_greatest_unit(amount, :day) do
    {:day, amount}
  end
end
