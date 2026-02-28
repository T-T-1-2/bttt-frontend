import { Component, ElementRef } from "@angular/core";
import { Clipboard } from "@angular/cdk/clipboard";
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { TranslateModule } from "@ngx-translate/core";
import { NgIf } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketService } from "../../core/socket-service";
import { first } from "rxjs";
import { environment } from "./../../environments/environment";
import { InfoDialogComponent } from "../info-dialog/info-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { PersistenceService } from "../../core/persistence.service";

@Component({
  selector: "app-preparation",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    TranslateModule,
    MatIcon
],
  templateUrl: "./preparation.component.html",
  styleUrl: "./preparation.component.scss"
})
export class PreparationComponent {

  private readonly copiedIcon = "check";

  player: "host" | "guest" | undefined;
  gameCode: string | undefined;
  gameCodeControl: FormControl<string | null>;
  isFromInviteLink = false;

  copiedGameCode = false;
  copiedLink = false;

  constructor(private router: Router,
              activatedRoute: ActivatedRoute,
              public persistenceService: PersistenceService,
              private socketService: SocketService,
              private clipboard: Clipboard,
              private dialog: MatDialog) {
    this.gameCodeControl = new FormControl("", {
      validators: [Validators.required, this.getCodeValidator()],
    });

    activatedRoute.queryParams.subscribe(params => {
      if (params["code"]) {
        this.gameCodeControl.setValue(params["code"]);
        this.isFromInviteLink = true;
      }
    });
  }

  getCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !new RegExp(/^[a-zA-Z]{4}$/).test(control.value)) {
        return {invalidFormat: true};
      } else {
        return null;
      }
    };
  }

  getGameCodeError(): string {
    if (this.gameCodeControl.hasError("invalidFormat")) {
      return "preparation.guest.error";
    } else {
      return "";
    }
  }

  private showErrorAndReset(type: string) {
    this.player = undefined;
    this.gameCode = undefined;
    this.gameCodeControl.enable();

    this.dialog.open(InfoDialogComponent, {
      data: {
        title: `preparation.error.${type}.title`,
        description: `preparation.error.${type}.description`,
      }
    });
  }

  getBackgroundColor() {
    return this.persistenceService.darkMode ? this.persistenceService.getHarshHighlightColor() : this.persistenceService.getSoftHighlightColor();
  }

  isHostButtonDisabled(): boolean {
    return !!this.player || this.isFromInviteLink;
  }

  isJoinButtonDisabled(): boolean {
    return !!this.player || this.gameCodeControl.invalid;
  }

  onHostClicked() {
    this.player = "host";
    this.gameCodeControl.disable();

    this.socketService.receivedConnected
      .pipe(first())
      .subscribe(connected => {
        if (connected.success) {
          this.gameCode = connected.code;
        } else {
          this.showErrorAndReset("overloaded");
          this.socketService.disconnect();
        }
    });
    this.socketService.receivedStarted
      .pipe(first())
      .subscribe(() => this.router.navigate(["/match"], { replaceUrl: true }));
    this.socketService.onError
      .pipe(first())
      .subscribe(() => this.showErrorAndReset("connection"));
    this.socketService.connectHost();
  }

  onCopyGameCodeClicked() {
    this.clipboard.copy(this.gameCode!);
    this.copiedGameCode = true;
    setTimeout(() => this.copiedGameCode = false, 1500);
  }

  onCopyLinkClicked() {
    this.clipboard.copy(`${environment.webUrl}/preparation?code=${this.gameCode!}`);
    this.copiedLink = true;
    setTimeout(() => this.copiedLink = false, 1500);
  }

  onJoinClicked() {
    this.player = "guest";
    this.gameCodeControl.disable();

    this.socketService.receivedConnected
      .pipe(first())
      .subscribe(connected => {
        if (!connected.success) {
          this.showErrorAndReset("code");
          this.socketService.disconnect();
        }
    });
    this.socketService.receivedStarted
      .pipe(first())
      .subscribe(() => this.router.navigate(["/match"], { replaceUrl: true }));
    this.socketService.onError
      .pipe(first())
      .subscribe(() => this.showErrorAndReset("connection"));
    this.socketService.connectGuest(this.gameCodeControl.value!);
  }
}
