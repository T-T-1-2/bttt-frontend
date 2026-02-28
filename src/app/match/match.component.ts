import { NgFor, NgIf, Location } from "@angular/common";
import { Component, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatRipple, MatRippleModule } from "@angular/material/core";
import { TranslateModule } from "@ngx-translate/core";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { BtttService, BtttCell, PlayerSymbol } from "../../core/bttt-service";
import { SocketService } from "../../core/socket-service";
import { first } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { InfoDialogComponent } from "../info-dialog/info-dialog.component";
import { PersistenceService } from "../../core/persistence.service";

@Component({
  selector: "app-match",
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    MatIconModule,
    MatRippleModule,
    MatButtonModule,
    TranslateModule,
    MatButton,
  ],
  providers: [ MatRipple ],
  templateUrl: "./match.component.html",
  styleUrl: "./match.component.scss"
})
export class MatchComponent {

  connected = false;

  constructor(private router: Router,
              private lcoation: Location,
              public socketService: SocketService,
              public btttService: BtttService,
              public persistenceService: PersistenceService,
              private dialog: MatDialog) {
    if (socketService.player) {
      this.btttService.start(socketService.player);
      this.socketService.receivedTurn
      .subscribe(move => {
          if (move.player === btttService.current) {
            btttService.update(move.x, move.y, move.player);
          }
        });
      this.socketService.receivedRematch
        .subscribe(() => this.btttService.reset())
      this.socketService.receivedQuit
        .pipe(first())
        .subscribe(initiator => this.showErrorAndReturn(initiator));
      this.socketService.onError
        .pipe(first())
        .subscribe(() => this.showErrorAndReturn("error"));
    } else {
    this.router.navigate(["/"], { replaceUrl: true }).then();
    }
  }

  @HostListener("window:beforeunload")
  canUnload(): boolean {
    return !!this.btttService.winner;
  }

  private showErrorAndReturn(initiator: string) {
    this.dialog.open(InfoDialogComponent, {
      data: {
        title: `match.quit.${initiator}.title`,
        description: `match.quit.${initiator}.description`,
      }
    });
    this.router.navigate(["/preparation"], { replaceUrl: true }).then();
  }

  getBackgroundColor(cell: BtttCell): string {
    if (cell.winning) {
      if (cell.symbol === this.btttService.player) {
        return this.persistenceService.getOwnColor();
      } else {
        return this.persistenceService.getOpponentColor();
      }
    } else if (cell.symbol === PlayerSymbol.none && !cell.blocked) {
      return this.persistenceService.getSoftHighlightColor();
    } else {
      return this.persistenceService.getHarshHighlightColor();
    }
  }

  onCellClicked(cell: BtttCell) {
    if (this.socketService.player === this.btttService.current) {
      this.btttService.update(cell.x, cell.y, this.socketService.player);
      this.socketService.sendTurn(cell.x, cell.y);
    }
  }

  getQuitText(): string {
    if (this.btttService.winner === this.btttService.player) {
      return "match.buttons.quitAfterWin";
    } else if (this.btttService.winner !== PlayerSymbol.none) {
      return "match.buttons.quitAfterLoss";
    } else {
      return "match.buttons.quitAfterTie";
    }
  }

  getRematchText(): string {
    if (this.btttService.winner === this.btttService.player) {
      return "match.buttons.rematchAfterWin";
    } else if (this.btttService.winner !== PlayerSymbol.none) {
      return "match.buttons.rematchAfterLoss";
    } else {
      return "match.buttons.rematchAfterTie";
    }
  }

  getWinsArc(): string {
    const total = this.btttService.wins + this.btttService.losses + this.btttService.ties;
    const to = this.btttService.wins / total;
    return this.getArc(0.0, to);
  }

  getLossesArc(): string {
    const total = this.btttService.wins + this.btttService.losses + this.btttService.ties;
    const from = this.btttService.wins / total;
    const to = (this.btttService.wins + this.btttService.losses) / total;
    return this.getArc(from, to);
  }

  getTiesArc(): string {
    const total = this.btttService.wins + this.btttService.losses + this.btttService.ties;
    const from = (this.btttService.wins + this.btttService.losses) / total;
    return this.getArc(from, 1.0);
  }

  private getArc(fromPercent: number, toPercent: number): string {
    const startAngle = Math.PI * 2 * fromPercent;
    const midAngle = Math.PI * 2 * (fromPercent + toPercent) / 2;
    const endAngle = Math.PI * 2 * toPercent;
    const x1 = 50 + 50 * Math.sin(startAngle);
    const y1 = 50 - 50 * Math.cos(startAngle);
    const x2 = 50 + 50 * Math.sin(midAngle);
    const y2 = 50 - 50 * Math.cos(midAngle);
    const x3 = 50 + 50 * Math.sin(endAngle);
    const y3 = 50 - 50 * Math.cos(endAngle);
    return `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} A 50 50 0 0 1 ${x3} ${y3} L 50 50`;
  }

  getPieStroke() {
    return this.persistenceService.darkMode ? "#303030" : "#FAFAFA";
  }

  onQuitClicked() {
    this.socketService.sendQuit();
    this.router.navigate(["/preparation"], { replaceUrl: true }).then();
  }

  onRematchClicked() {
    this.socketService.sendRematch();
    this.btttService.reset();
  }
}
