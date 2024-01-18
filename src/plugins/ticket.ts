import { ChannelType, Colors, Events } from "discord.js";
import { Log } from "dixt";

import CHANNELS from "../constants/channels";
import MESSAGES from "../constants/messages";
import TicketController from "../controllers/ticket";
import { DiscordPlugin } from "../types/plugin";
import { TicketType } from "../types/ticket";

const TicketPlugin: DiscordPlugin = (client) => {
  client.on(Events.ClientReady, async () => {
    const supportChannel = await client.channels.cache.get(
      CHANNELS.INFORMATIONS.SUPPORT,
    );
    const meetingChannel = await client.channels.cache.get(
      CHANNELS.INFORMATIONS.RENDEZ_VOUS,
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

    await interaction.deferReply({ ephemeral: true });

    if (
      interaction.channel &&
      interaction.channel.type === ChannelType.GuildText &&
      interaction.customId === "ticket_close"
    ) {
      await TicketController.closeTicket(interaction.user, interaction.channel);
      return;
    }

    try {
      const embed = await TicketController.createTicket(
        interaction.guild,
        interaction.member,
        interaction.customId.slice(
          interaction.customId.indexOf("_") + 1,
        ) as TicketType,
      );

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (e) {
      Log.error(e);
      await interaction.editReply({
        embeds: [
          {
            ...TicketController.baseEmbed,
            color: Colors.Red,
            description: MESSAGES.ERROR.DM_BLOCKED,
          },
        ],
      });
    }
  });

  client.on(Events.GuildMemberRemove, async (member) => {
    const ticketsChannels = await TicketController.getUserTicketsChannels(
      member.guild,
      member.user,
    );

    await Promise.all(
      ticketsChannels.map(async (channel) => {
        await TicketController.closeTicket(member.user, channel);
      }),
    );
  });
};

export default TicketPlugin;
