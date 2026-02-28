import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

export interface InfoDialogData {
  title: string;
  description: string;
}

@Component({
  selector: 'app-info-dialog',
  standalone: true,
    imports: [
      MatButtonModule,
      MatDialogModule,
      TranslatePipe,
    ],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.scss'
})
export class InfoDialogComponent {

  data: InfoDialogData;

  constructor() {
    this.data = inject(MAT_DIALOG_DATA);
  }
}
