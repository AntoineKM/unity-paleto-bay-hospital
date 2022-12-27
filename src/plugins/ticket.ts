import { Events, TextChannel } from "discord.js";
import CHANNELS from "../constants/channels";
import TicketController from "../controllers/ticket";
import { DiscordPlugin } from "../types/plugin";
import { TicketType } from "../types/ticket";

const TicketPlugin: DiscordPlugin = (client) => {
  client.on(Events.ClientReady, async () => {
    const supportChannel = await client.channels.cache.get(
      CHANNELS.INFORMATIONS.SUPPORT
    );
    const meetingChannel = await client.channels.cache.get(
      CHANNELS.INFORMATIONS.RENDEZ_VOUS
    );
    if (!supportChannel || !meetingChannel) return;

    TicketController.initialize(supportChannel, "support");
    TicketController.initialize(meetingChannel, "meeting");
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("ticket_")) return;
    if (!interaction.guild) return;

    await interaction.deferReply();

    if (interaction.customId === "ticket_close") {
      await interaction.deleteReply();
      await TicketController.closeTicket(
        interaction.user,
        interaction.channel as TextChannel
      );
      return;
    }

    await TicketController.createTicket(
      interaction.guild,
      interaction.user,
      // remove the prefix before the first "_" from the interaction.customId but do not split because after the first "_" there is the ticket type which can contain "_"
      interaction.customId.slice(
        interaction.customId.indexOf("_") + 1
      ) as TicketType
    );

    await interaction.deleteReply();
  });
};

export default TicketPlugin;
