import { REST, Routes } from "discord.js";

import DiscordApplication from "../services/discord";
import { ClientWithCommands } from "../types/command";
import Log from "../utils/log";

class CommandsController {
  public static async deployCommands(
    client: ClientWithCommands
  ): Promise<void> {
    const rest = new REST().setToken(DiscordApplication.bot.token);

    try {
      Log.event(
        `started refreshing ${client.commands?.size} application (/) commands.`
      );

      const data: any = await rest.put(
        Routes.applicationCommands(DiscordApplication.id),
        {
          body: client.commands?.map((command) =>
            (command as any).data.toJSON()
          ),
        }
      );

      Log.ready(
        `successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      Log.error(error);
    }
  }
}

export default CommandsController;
