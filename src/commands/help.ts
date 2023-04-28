import { APIEmbed, Colors, SlashCommandBuilder } from "discord.js";

import APP from "../constants/app";
import { ClientWithCommands, DiscordCommand } from "../types/command";
import capitalize from "../utils/capitalize";

const HelpCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Liste toutes les commandes ou donne des informations sur une commande spécifique."
    )
    .addStringOption((option) => {
      return option.setName("command").setDescription("La commande à exécuter");
    }),
  async execute(interaction) {
    const command = interaction.options.getString("command");
    const commands = (interaction.client as ClientWithCommands).commands;
    let baseEmbed: APIEmbed = {
      color: Colors.White,
      title: "Help",
      footer: {
        text: APP.NAME,
        icon_url: APP.LOGO,
      },
    };

    if (command && commands) {
      const slashCommand: any = commands.get(command);
      if (slashCommand) {
        baseEmbed = {
          ...baseEmbed,
          title: `${baseEmbed.title} - ${capitalize(slashCommand.data.name)}`,
          description: `${
            slashCommand.data.description
          }\n\n${slashCommand.data.options
            .map(
              (option) =>
                `\`/${slashCommand.data.name} <${option.toJSON().name}>\` - ${
                  option.toJSON().description
                }`
            )
            .join("\n")}`,
        };
      } else {
        baseEmbed = {
          ...baseEmbed,
          description: `La commande \`${command}\` n'existe pas.`,
        };
      }
    } else {
      baseEmbed = {
        ...baseEmbed,
        description: `Utilisez \`/${
          (interaction as any).commandName
        } <command>\` pour obtenir des informations sur une commande spécifique.\n
      ${
        commands
          ? commands
              .map(
                (command) =>
                  `\`/${(command as any).data.name}\` - ${
                    (command as any).data.description
                  }`
              )
              .join("\n")
          : "No commands found."
      }`,
      };
    }

    await interaction.reply({ embeds: [baseEmbed] });
  },
};

export default HelpCommand;
