import { Injectable } from "@angular/core";

export enum PlayerSymbol {
  none = "none",
  guest = "guest",
  host = "host",
}

export interface BtttCell {
  x: number;
  y: number;
  symbol: PlayerSymbol;
  blocked: boolean;
  winning: boolean;
}

@Injectable({
  providedIn: "root",
})
export class BtttService {

  private readonly expandedSize = 5;
  private readonly defaultSize = 3;
  private readonly maxTurns = this.defaultSize * this.defaultSize;

  player!: PlayerSymbol;
  current!: PlayerSymbol;
  cells: BtttCell[][] = [];
  turn: number = 0;
  winner: PlayerSymbol | undefined;

  wins: number = 0;
  losses: number = 0;
  ties: number = 0;

  isBlocked(cell: BtttCell): boolean {
    return !!this.winner || cell.symbol !== PlayerSymbol.none || cell.blocked;
  }

  hasPlayerWon() {
    return this.winner === this.player;
  }

  hasPlayerLost() {
    return this.winner !== this.player && this.winner !== PlayerSymbol.none;
  }

  hasPlayerTied() {
    return this.winner === PlayerSymbol.none;
  }

  start(player: PlayerSymbol) {
    this.player = player;
    this.winner = undefined;
    this.wins = 0;
    this.losses = 0;
    this.ties = 0;
    this.reset();
  }

  reset() {
    this.cells.splice(0, this.cells.length);
    for (let y = 0; y < this.expandedSize; ++y) {
      this.cells.push([]);
      for (let x = 0; x < this.expandedSize; ++x) {
        this.cells[y].push({
          x: x,
          y: y,
          symbol: PlayerSymbol.none,
          blocked: true,
          winning: false,
        });
      }
    }

    const center = Math.trunc(this.expandedSize / 2);
    this.cells[center][center].blocked = false;

    this.turn = 0;
    if (this.winner === PlayerSymbol.host) {
      this.current = PlayerSymbol.guest;
    } else if (this.winner === PlayerSymbol.guest) {
      this.current = PlayerSymbol.host;
    } else {
      this.current = PlayerSymbol.host;
    }
    this.winner = undefined;
  }

  update(cell: BtttCell) {
    if (this.isBlocked(cell)) {
      return;
    }

    this.turn++;
    cell.symbol = this.current;

    this.updateBlockedAndCheckForWinsOrTie();

    if (this.current === PlayerSymbol.host) {
      this.current = PlayerSymbol.guest;
    } else {
      this.current = PlayerSymbol.host;
    }
  }

  private getRow(minX: number, y: number): BtttCell[] {
    const cells: BtttCell[] = [];
    for (let deltaX = 0; deltaX < this.defaultSize; ++deltaX) {
      cells.push(this.cells[y][minX + deltaX]);
    }
    return cells;
  }

  private getColumn(x: number, minY: number): BtttCell[] {
    const cells: BtttCell[] = [];
    for (let deltaY = 0; deltaY < this.defaultSize; ++deltaY) {
      cells.push(this.cells[minY + deltaY][x]);
    }
    return cells;
  }

  private getForwardDiagonal(minX: number, minY: number): BtttCell[] {
    const cells: BtttCell[] = [];
    for (let delta = 0; delta < this.defaultSize; ++delta) {
      cells.push(this.cells[minY + delta][minX + delta]);
    }
    return cells;
  }

  private getBackwardDiagonal(minX: number, minY: number): BtttCell[] {
    const cells: BtttCell[] = [];
    for (let delta = 0; delta < this.defaultSize; ++delta) {
      cells.push(this.cells[minY + this.defaultSize - 1 - delta][minX + delta]);
    }
    return cells;
  }

  private updateBlockedAndCheckForWinsOrTie() {
    let minX = this.expandedSize;
    let minY = this.expandedSize;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < this.expandedSize; ++y) {
      for (let x = 0; x < this.expandedSize; ++x) {
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

    for (let y = 0; y < this.expandedSize; ++y) {
      for (let x = 0; x < this.expandedSize; ++x) {
        const cell = this.cells[y][x];
        if (cell.symbol === PlayerSymbol.none) {
          cell.blocked = x < minX || x > maxX || y < minY || y > maxY;
        }
      }
    }

    this.checkEndOfGame(minX, minY, maxX, maxY, width, height);
  }

  private checkEndOfGame(minX: number, minY: number, maxX: number, maxY: number, width: number, height: number) {
    let won = false;

    if (width == this.defaultSize) {
      for (let y = minY; y <= maxY; ++y) {
        won = won || this.checkForWin(this.getRow(minX, y));
      }
    }

    if (height == this.defaultSize) {
      for (let x = minX; x <= maxX; ++x) {
        won = won || this.checkForWin(this.getColumn(x, minY));
      }
    }

    if (width == this.defaultSize && height == this.defaultSize) {
      won = won || this.checkForWin(this.getForwardDiagonal(minX, minY))
        || this.checkForWin(this.getBackwardDiagonal(minX, minY));
    }

    if (won) {
      this.winner = this.current;
      if (this.winner === this.player) {
        this.wins++;
      } else {
        this.losses++;
      }
    } else if (this.checkForTie(minX, minY)) {
      this.winner = PlayerSymbol.none;
      this.ties++;
    }
  }

  private checkForWin(cells: BtttCell[]): boolean {
    const symbol = cells[0].symbol;
    if (symbol !== PlayerSymbol.none && cells.every(c => c.symbol === symbol)) {
      cells.forEach(c => c.winning = true);
      return true;
    }
    return false;
  }

  private checkForTie(minX: number, minY: number): boolean {
    if (this.turn < this.maxTurns - 2) {
      return false;
    }

    return  this.cells.flatMap(c => c)
      .filter(c => !c.blocked && c.symbol === PlayerSymbol.none)
      .every(c => this.checkIfCellIsTied(minX, minY, c));
  }

  private checkIfCellIsTied(minX: number, minY: number, cell: BtttCell): boolean {
    if (!this.checkIfCellsAreTied(this.getRow(minX, cell.y))) {
      return false;
    }

    if (!this.checkIfCellsAreTied(this.getColumn(cell.x, minY))) {
      return false;
    }

    for (let delta = 0; delta < this.defaultSize; ++delta) {
      if (cell.x == minX + delta && cell.y == minY + delta) {
        if (!this.checkIfCellsAreTied(this.getForwardDiagonal(minX, minY))) {
          return false;
        }
      }
    }

    for (let delta = 0; delta < this.defaultSize; ++delta) {
      if (cell.x == minX + delta && cell.y == minY + this.defaultSize - 1 - delta) {
        if (!this.checkIfCellsAreTied(this.getBackwardDiagonal(minX, minY))) {
          return false;
        }
      }
    }

    return true;
  }

  private checkIfCellsAreTied(cells: BtttCell[]): boolean {
    const remainingTurns = this.maxTurns - this.turn;
    return cells.filter(c => c.symbol === PlayerSymbol.none).length >= remainingTurns
      || (cells.some(c => c.symbol === PlayerSymbol.host) && cells.some(c => c.symbol === PlayerSymbol.guest));
  }
}
