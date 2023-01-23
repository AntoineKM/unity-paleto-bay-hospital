import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";
import CHANNELS from "../constants/channels";
import MESSAGES from "../constants/messages";
import ROLES from "../constants/roles";
import WarnController from "../controllers/warn";
import { DiscordCommand } from "../types/command";
import Log from "../utils/log";

const WarnCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Avertir un membre")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Le membre à qui appliquer la commande")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("La raison de l'avertissement")
        .setRequired(false)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "Privée";

    if (!interaction.inCachedGuild()) {
      interaction.reply({
        content: MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_DM,
      });
      setTimeout(async () => {
        await interaction.deleteReply();
      }, 5000);
      return;
    } else {
      if (
        !interaction.member.roles.cache.has(ROLES.DIRECTION) &&
        !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
      ) {
        await interaction.reply({
          embeds: [
            {
              ...WarnController.baseEmbed,
              description: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
            },
          ],
        });
      } else {
        if (target && reason) {
          await WarnController.add(target.id, reason);
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

          // send a message to the CHANNELS.ONRUNTIME.TEAM.INFORMATION.WARN channel
          // with the target and the reason

          // get all guilds to get the CHANNELS.ONRUNTIME.TEAM.INFORMATION.WARN channel
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
            }** avertissement${
              warns.length > 1 ? "s" : ""
            }.\nRaison: *${reason}*`,
          };

          await channel.send({ embeds: [warnEmbed] });

          Log.info(
            `${interaction.user.username} warned ${target.username} for ${reason}`
          );

          // send a message to the target with the reason
          await target.send({
            embeds: [
              {
                ...WarnController.baseEmbed,
                description: `Vous avez été averti pour la raison suivante: **${reason}**\n*Si vous pensez que c'est une erreur ou pour en savoir plus sur la raison, merci de contacter un membre de la direction.*`,
              },
            ],
          });
        }
      }
    }
  },
};

export default WarnCommand;
