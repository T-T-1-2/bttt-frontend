import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PersistenceService } from '../../core/persistence.service';
import { MatIcon } from "@angular/material/icon";
import { NgFor, NgIf } from '@angular/common';
import { Subscription, interval } from 'rxjs';

export interface DemoCell {
  symbol: string | undefined;
  blocked: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    MatButtonModule,
    TranslateModule,
    NgFor,
    NgIf,
    MatIcon
],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnDestroy {

  cells: DemoCell[][] = [];
  lastX = -1;
  lastY = -1;

  timer: Subscription;

  constructor(
    private router: Router,
    private persistenceService: PersistenceService
  ) {
    this.timer = interval(1000).subscribe(() => this.update());
    this.update();
  }

  ngOnDestroy(): void {
    this.timer.unsubscribe();
  }

  private update() {
    this.cells.splice(0, this.cells.length);

    let targetX = Math.round(Math.random() * 4);
    let targetY = Math.round(Math.random() * 4);

    while ((targetX === this.lastX && targetY === this.lastY) || (targetX === 2 && targetY === 2)) {
      targetX = Math.round(Math.random() * 4);
      targetY = Math.round(Math.random() * 4);
    }

    let minX = Math.min(targetX, 2);
    let maxX = Math.max(targetX, 2);
    const width = maxX - minX + 1;
    minX -= 3 - width;
    maxX += 3 - width;

    let minY = Math.min(targetY, 2);
    let maxY = Math.max(targetY, 2);
    const height = maxY - minY + 1;
    minY -= 3 - height;
    maxY += 3 - height;

    for (let y = 0; y < 5; ++y) {
      this.cells.push([]);
      for (let x = 0; x < 5; ++x) {
        const symbol = x === 2 && y === 2
          ? this.persistenceService.opponentSymbol
          : x === targetX && y === targetY
          ? this.persistenceService.ownSymbol
          : undefined;

        this.cells[y].push({
          symbol: symbol,
          blocked: x < minX || x > maxX || y < minY || y > maxY,
        });
      }
    }
  }

  getBackgroundColor(cell: DemoCell) {
    return cell.blocked
      ? this.persistenceService.getHarshHighlightColor()
      : this.persistenceService.getSoftHighlightColor();
  }

  onStartClicked() {
    this.router.navigate(["/preparation"], { replaceUrl: true });
  }
}
