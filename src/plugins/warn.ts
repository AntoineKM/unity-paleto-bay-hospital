import { ChannelType, Events, TextChannel } from "discord.js";
import { DiscordPlugin } from "../types/plugin";
import WarnController from "../controllers/warn";
import Log from "../utils/log";
import CHANNELS from "../constants/channels";

const WarnPlugin: DiscordPlugin = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("warn_")) return;
    if (!interaction.guild) return;
    if (!interaction.member || !interaction.member.user) return;

    if (interaction.customId.startsWith("warn_add")) {
      const reason = "Absence de plus de 2 jours non justifiée";
      const [, userId] = interaction.customId.split(":");
      const member = await interaction.guild.members.fetch(userId);
      const target = member?.user;
      if (!member) return;
      await WarnController.add(userId, reason);
      const warns = await WarnController.get(target.id);
      await interaction.reply({
        embeds: [
          {
            ...WarnController.baseEmbed,
            description: `**${target}** a reçu un avertissement et à maintenant **${
              warns.length
            }** avertissement${warns.length > 1 ? "s" : ""}.\nRaison${
              warns.length
            }:\n ${warns
              .map((warn, i) => `${i + 1}. ${warn.reason}`)
              .join("\n")}`,
          },
        ],
        ephemeral: true,
      });

      await interaction.client.guilds.fetch();
      // get the CHANNELS.ONRUNTIME.TEAM.INFORMATION.WARN channel
      const guilds = interaction.client.channels.cache;
      // dont use forEach because it's async and we need to wait for the result, so use map
      const channels = await Promise.all(
        guilds.map(async (guild) => {
          const channel = await guild.fetch();
          return channel;
        })
      );
      // get the CHANNELS.ONRUNTIME.TEAM.INFORMATION.WARN channel
      const channel = channels.find(
        (channel) =>
          channel.id === CHANNELS.INFORMATIONS_EMS.AVERTISSEMENTS &&
          channel.type === ChannelType.GuildText
      ) as TextChannel;

      const warnEmbed = {
        ...WarnController.baseEmbed,
        description: `**${target}** a reçu un avertissement et à maintenant **${
          warns.length
        }** avertissement${warns.length > 1 ? "s" : ""}.\nRaison: *${reason}*`,
      };

      await channel.send({ embeds: [warnEmbed] });

      Log.info(
        `${interaction.user.username} warned ${target.username} for ${reason}`
      );

      target
        .send({
          embeds: [
            {
              ...WarnController.baseEmbed,
              description: `Vous avez été averti pour la raison suivante: **${reason}**\n*Si vous pensez que c'est une erreur ou pour en savoir plus sur la raison, merci de contacter un membre de la direction.*`,
            },
          ],
        })
        .catch((e) => Log.error(target, e));

      setTimeout(async () => {
        await interaction.deleteReply();
        await interaction.message.delete();
      }, 5000);
      return;
    }
  });
};

export default WarnPlugin;
