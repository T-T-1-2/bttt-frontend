import { NgFor, NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatRipple, MatRippleModule } from "@angular/material/core";
import { TranslateModule } from "@ngx-translate/core";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { BtttService, BtttCell, PlayerSymbol } from "../../core/bttt-service";

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

  constructor(private router: Router,
              activatedRoute: ActivatedRoute,
              public bttt: BtttService) {
    activatedRoute.queryParams.subscribe(params => {
      if (params["code"] && params["player"]) {
        this.connect(params["code"], params["player"]);
      } else { // TODO!
        console.log("whoopsie daisy");

        // dialog.open(InfoDialogComponent, {
        //   data: {
        //     title: "match.info.disconnected.title",
        //     description: "match.info.disconnected.description",
        //   }
        // });
      }
    });
  }

  private connect(code: string, player: "host" | "guest") {
    this.bttt.start(player === "host" ? PlayerSymbol.host : PlayerSymbol.guest);
    // TODO!
  }

  getBackgroundColor(cell: BtttCell): string {
    if (cell.winning) {
      if (cell.symbol === this.bttt.player) {
        return "#208020";
      } else {
        return "#802020";
      }
    } else if (cell.symbol === PlayerSymbol.none && !cell.blocked) {
      return "#606060";
    } else {
      return "#404040";
    }
  }

  onCellClicked(cell: BtttCell) {
    this.bttt.update(cell);
  }

  getQuitText(): string {
    if (this.bttt.winner === this.bttt.player) {
      return "match.buttons.quitAfterWin";
    } else if (this.bttt.winner !== PlayerSymbol.none) {
      return "match.buttons.quitAfterLoss";
    } else {
      return "match.buttons.quitAfterTie";
    }
  }

  getRematchText(): string {
    if (this.bttt.winner === this.bttt.player) {
      return "match.buttons.rematchAfterWin";
    } else if (this.bttt.winner !== PlayerSymbol.none) {
      return "match.buttons.rematchAfterLoss";
    } else {
      return "match.buttons.rematchAfterTie";
    }
  }

  getWinsArc(): string {
    const total = this.bttt.wins + this.bttt.losses + this.bttt.ties;
    const to = this.bttt.wins / total;
    return this.getArc(0.0, to);
  }

  getLossesArc(): string {
    const total = this.bttt.wins + this.bttt.losses + this.bttt.ties;
    const from = this.bttt.wins / total;
    const to = (this.bttt.wins + this.bttt.losses) / total;
    return this.getArc(from, to);
  }

  getTiesArc(): string {
    const total = this.bttt.wins + this.bttt.losses + this.bttt.ties;
    const from = (this.bttt.wins + this.bttt.losses) / total;
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

  onQuitClicked() {
    this.router.navigate(["/"]).then();
  }

  onRematchClicked() {
    this.bttt.reset();
  }
}
