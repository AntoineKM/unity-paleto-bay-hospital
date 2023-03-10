import { Colors, Events, GuildMember, TextChannel } from "discord.js";
import CHANNELS from "../constants/channels";
import MESSAGES from "../constants/messages";
import TicketController from "../controllers/ticket";
import { DiscordPlugin } from "../types/plugin";
import { TicketType } from "../types/ticket";
import { setTimeout as wait } from "node:timers/promises";

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
    if (!interaction.member || !interaction.member.user) return;

    if (interaction.customId === "ticket_close") {
      await interaction.deferReply();
      await interaction.deleteReply();
      await TicketController.closeTicket(
        interaction.user,
        interaction.channel as TextChannel
      );
      return;
    }

    try {
      await TicketController.createTicket(
        interaction.guild,
        interaction.member as GuildMember,
        // remove the prefix before the first "_" from the interaction.customId but do not split because after the first "_" there is the ticket type which can contain "_"
        interaction.customId.slice(
          interaction.customId.indexOf("_") + 1
        ) as TicketType
      );
      await interaction.deferReply();
      await wait(250);
      await interaction.deleteReply();
    } catch (e) {
      await interaction.reply({
        embeds: [
          {
            ...TicketController.baseEmbed,
            color: Colors.Red,
            description: MESSAGES.ERROR.DM_BLOCKED,
          },
        ],
        ephemeral: true,
      });
    }
  });

  client.on(Events.GuildMemberRemove, async (member) => {
    const ticketsChannels = await TicketController.getUserTicketsChannels(
      member.guild,
      member.user
    );

    await Promise.all(
      ticketsChannels.map(async (channel) => {
        await TicketController.closeTicket(member.user, channel);
      })
    );
  });
};

export default TicketPlugin;
