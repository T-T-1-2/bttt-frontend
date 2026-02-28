import { Injectable, OnDestroy } from "@angular/core";
import { WebSocketSubject, webSocket } from "rxjs/webSocket";
import { Subject } from "rxjs";
import { ConnectedMessage, ErrorMessage, QuitMessage, SocketMessage, TurnMessage } from "./messages";
import { environment } from "./../environments/environment";
import { PlayerSymbol } from "./bttt-service";

@Injectable({
  providedIn: "root",
})
export class SocketService implements OnDestroy {

  private socket$!: WebSocketSubject<any>;
  player: PlayerSymbol | undefined;

  // Triggered when the player connected.
  receivedConnected = new Subject<ConnectedMessage>();
  // Triggered when guest joined.
  receivedStarted = new Subject<void>();
  // Triggered when opponent quit. Value is 'server' when a fatal exception occurred or 'client' when the opponent sent a quit message.
  receivedQuit = new Subject<string>();
  // Triggered when the opponent does a turn
  receivedTurn = new Subject<TurnMessage>();
  // Triggered when the opponent request a rematch
  receivedRematch = new Subject<void>();

  onError = new Subject<void>();

  ngOnDestroy() {
    if (this.player) {
      this.sendQuit();
      this.disconnect();
    }
  }

  connectHost() {
    this.player = PlayerSymbol.host;
    this.connect();
    this.sendMessage("connect", {
      player: "host",
      code: "",
    });
  }

  connectGuest(code: string) {
    this.player = PlayerSymbol.guest;
    this.connect();
    this.sendMessage("connect", {
      player: "guest",
      code: code,
    });
  }

  private connect() {
    this.socket$ = webSocket(environment.socketUrl);
    this.socket$.subscribe({
      next: socketMessage => {
        const message = socketMessage as SocketMessage;
        if (message.type === "error") {
          const error = JSON.parse(message.payload) as ErrorMessage;
          this.onErrorMessageReceived(error.type, error.message);
        } else {
          this.onMessageReceived(message.type, message.payload);
        }
      },
      error: error => {
        this.onError.next(error)
      },
      complete: () => {},
    });
  }

  private onErrorMessageReceived(type: string, message: string) {
    console.log("socket error. type:", type, "error message:", message);
  }

  private onMessageReceived(type: string, payload: any) {
    if (type === "connected") {
      const message = JSON.parse(payload) as ConnectedMessage;
      this.receivedConnected.next(message);
    } else if (type === "started") {
      this.receivedStarted.next();
    } else if (type === "quit") {
      const message = JSON.parse(payload) as QuitMessage;
      this.receivedQuit.next(message.initiator);
    } else if (type === "turn") {
      const message = JSON.parse(payload) as TurnMessage;
      this.receivedTurn.next(message);
    } else if (type === "rematch") {
      this.receivedRematch.next();
    } else {
      console.log("invalid socket message. type:", type, "payload:", payload);
    }
  }

  private sendMessage(type: string, payload: any) {
    if (this.player) {
      this.socket$.next({
        type: type,
        payload: JSON.stringify(payload),
      });
    }
  }

  sendTurn(x: number, y: number) {
    this.sendMessage("turn", {
      x: x,
      y: y,
      player: this.player,
    });
  }

  sendRematch() {
    this.sendMessage("rematch", "");
  }

  sendQuit() {
    this.sendMessage("quit", {
      initiator: "client",
    });
  }

  disconnect() {
    this.player = undefined;
    this.socket$.complete();
  }
}
