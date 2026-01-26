import { getNumberOfCurrencyDigits, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatRipple, MatRippleModule } from '@angular/material/core';

export enum PlayerSymbol {
  none = "none",
  guest = "guest",
  host = "host",
}

export interface TttCell {
  x: number;
  y: number;
  symbol: PlayerSymbol;
  blocked: boolean;
  winning: boolean;
}

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    MatIconModule,
    MatRippleModule,
  ],
  providers: [ MatRipple ],
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss'
})
export class MatchComponent {

  private readonly expanedSize = 5;
  private readonly defaultSize = 3;

  player!: PlayerSymbol;
  cells: TttCell[][] = [];

  constructor(activatedRoute: ActivatedRoute) {
    this.resetCells();

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

  private resetCells() {
    this.cells.splice(0, this.cells.length);
    for (let y = 0; y < this.expanedSize; ++y) {
      this.cells.push([]);
      for (let x = 0; x < this.expanedSize; ++x) {
        this.cells[y].push({
          x: x,
          y: y,
          symbol: PlayerSymbol.none,
          blocked: true,
          winning: false,
        });
      }
    }
    this.cells[2][2].blocked = false;
  }

  updateBlockedCells() {
    let minX = this.expanedSize;
    let minY = this.expanedSize;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < this.expanedSize; ++y) {
      for (let x = 0; x < this.expanedSize; ++x) {
        const cell = this.cells[y][x];
        if (cell.symbol !== PlayerSymbol.none) {
          minX = Math.min(cell.x, minX);
          minY = Math.min(cell.y, minY);
          maxX = Math.max(cell.x, maxX);
          maxY = Math.max(cell.y, maxY);
        }
      }
    }

    const width = maxX - minX + 1;
    minX -= this.defaultSize - width;
    maxX += this.defaultSize - width;

    const height = maxY - minY + 1;
    minY -= this.defaultSize - height;
    maxY += this.defaultSize - height;

    for (let y = 0; y < this.expanedSize; ++y) {
      for (let x = 0; x < this.expanedSize; ++x) {
        const cell = this.cells[y][x];
        if (cell.symbol === PlayerSymbol.none) {
          cell.blocked = x < minX || x > maxX || y < minY || y > maxY;
        }
      }
    }
  }

  checkForAllWins(minX: number, minY: number, maxX: number, maxY: number, width: number, height: number) {
    let wins = 0;

    if (width >= this.defaultSize) {
      for (let y = minY; y <= maxY; ++y) {
        for (let x = minX; x < this.defaultSize - width; ++x) {
          wins += this.checkForWinInRow(x, y);
        }
      }
    }

    if (height >= this.defaultSize) {
      for (let x = minX; x <= maxX; ++x) {
        for (let y = minY; y < this.defaultSize - height; ++y) {
          wins += this.checkForWinInColumn(x, y);
        }
      }
    }

    if (width >= this.defaultSize && height >= this.defaultSize) {
      for (let y = minY; y <= maxY; ++y) {
        for (let y = minY; y < this.defaultSize - height; ++y) {
          wins += this.checkForWinInForewardDiagonal(x, y);
          wins += this.checkForWinInBackwardDiagonal(x, y);
        }
      }
    }

    // TODO! tie check
  }

  private checkForWinInRow(minX: number, y: number): number {
    const cells: TttCell[] = [];
    for (let deltaX = 0; deltaX < this.defaultSize; ++deltaX) {
      cells.push(this.cells[y][minX + deltaX]);
    }
    return this.checkForWin(cells);
  }

  private checkForWinInColumn(x: number, minY: number): number {
    const cells: TttCell[] = [];
    for (let deltaY = 0; deltaY < this.defaultSize; ++deltaY) {
      cells.push(this.cells[minY + deltaY][x]);
    }
    return this.checkForWin(cells);
  }

  private checkForWin(cells: TttCell[]): number {
    const symbol = cells[0].symbol;
    if (symbol !== PlayerSymbol.none && !cells.some(c => c.symbol !== symbol)) {
      return 1;
    }
    return 0;
  }

  private connect(code: string, player: "host" | "guest") {
    this.player = player === "host" ? PlayerSymbol.host : PlayerSymbol.guest;
    // TODO!
  }

  getBackgroundColor(cell: TttCell): string {
    if (cell.winning) {
      if (cell.symbol === this.player) {
        return "#208020";
      } else {
        return "#802020";
      }
    } else if (cell.symbol === PlayerSymbol.none && !cell.blocked) {
      return "#505050";
    } else {
      return "#404040";
    }
  }

  isBlocked(cell: TttCell): boolean {
    return cell.symbol !== PlayerSymbol.none || cell.blocked;
  }

  onCellClicked(cell: TttCell) {
    if (this.isBlocked(cell)) {
      return;
    }

    cell.symbol = this.player;
    this.updateBlockedCells();

    if (this.player === PlayerSymbol.host) {
      this.player = PlayerSymbol.guest;
    } else {
      this.player = PlayerSymbol.host;
    }
  }
}
