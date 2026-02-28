import { PlayerSymbol } from "./bttt-service";

export interface SocketMessage {
  type: string;
  payload: any;
}

export interface ConnectedMessage {
  success: boolean;
  code: string;
}

export interface QuitMessage {
  initiator: string;
}

export interface ErrorMessage {
  type: string;
  message: string;
}

export interface TurnMessage {
  player: PlayerSymbol;
  x: number;
  y: number;
}
