import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatToolbarModule,
    MatIconModule,
    RouterOutlet,
    TranslateModule,
],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent {

  constructor(private translate: TranslateService, private matIconReg: MatIconRegistry) {
    this.translate.addLangs(["en"]);
    this.translate.setDefaultLang("en");
    // this.persistence.load();
  }

  ngOnInit(): void {
    this.matIconReg.setDefaultFontSetClass("material-symbols-outlined");
  }

}
