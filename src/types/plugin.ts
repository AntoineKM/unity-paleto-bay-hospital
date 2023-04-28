import { ClientWithCommands } from "./command";

export type DiscordPlugin = (_client: ClientWithCommands) => void;
