import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { SettingsComponent } from "./settings/settings.component";
import { MatButtonModule } from "@angular/material/button";
import { PersistenceService } from "../core/persistence.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    TranslateModule,
],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent {

  constructor(private translate: TranslateService,
              private matIconReg: MatIconRegistry,
              private persistenceService: PersistenceService,
              private dialog: MatDialog) {
    this.translate.addLangs(["en", "de"]);
    this.translate.setDefaultLang(persistenceService.language);
    this.persistenceService.load();
  }

  onOpenSettingsClick() {
    this.dialog.open(SettingsComponent, {
      width: "400px",
    });
  }

  ngOnInit(): void {
    this.matIconReg.setDefaultFontSetClass("material-symbols-outlined");
  }
}
