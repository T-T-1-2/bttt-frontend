import { Component, Output } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { MatIcon } from "@angular/material/icon";
import { StartGameResponse } from '../../core/http-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preparation',
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
  templateUrl: './preparation.component.html',
  styleUrl: './preparation.component.scss'
})
export class PreparationComponent {

  player: "host" | "guest" | undefined;
  gameCode: string | undefined;
  gameCodeControl: FormControl<string | null>;

  constructor(private router: Router, private clipboard: Clipboard) {
    this.gameCodeControl = new FormControl("", {
      validators: [Validators.required, this.getCodeValidator()],
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
    if (this.gameCodeControl.hasError('invalidFormat')) {
      return "preparation.guest.error";
    } else {
      return '';
    }
  }

  isHostButtonDisabled(): boolean {
    return !!this.player;
  }

  isJoinInputDisabled(): boolean {
    return !!this.player;
  }

  isJoinButtonDisabled(): boolean {
    return !!this.player || this.gameCodeControl.invalid;
  }

  onHostClicked() {
    this.player = "host";
    this.gameCodeControl.disable();

    // TODO! try host & wait for opponent
    const response: StartGameResponse = {
        code: "ASDF",
      };

    this.gameCode = response.code;

    setTimeout(() => this.router.navigate(["/match"], {
      queryParams: {
        code: this.gameCode,
        player: this.player
      }
    }).then(), 1000);
  }

  onCopyGameCodeClicked() {
    this.clipboard.copy(this.gameCode!);
  }

  onCopyLinkClicked() { // TODO! get full url
    this.clipboard.copy(`localhost:4200/match?code=${this.gameCode!}&player=guest`);
  }

  onJoinClicked() {
    this.player = "guest";
    this.gameCodeControl.disable();

    // TODO! try join & nav

    this.router.navigate(["/match"], {
      queryParams: {
        code: this.gameCodeControl.value,
        player: this.player
      }
    }).then();
  }

  private reset() {
    this.player = undefined;
    this.gameCode = undefined;
  }
}
