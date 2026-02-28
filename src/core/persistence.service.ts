import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class PersistenceService {

  private static readonly ownColorKey = "ownColor";
  private static readonly opponentColorKey = "opponentColor";
  private static readonly neutralColorKey = "neutralColor";
  private static readonly ownSymbolKey = "ownSymbol";
  private static readonly opponentSymbolKey = "opponentSymbol";
  private static readonly darkModeKey = "darkMode";
  private static readonly languageKey = "language";

  public static readonly defaultOwnColor = 2;
  public static readonly defaultOpponentColor = 0;
  public static readonly defaultNeutralColor = 1;
  public static readonly defaultOwnSymbol = "close";
  public static readonly defaultOpponentSymbol = "circle";
  public static readonly defaultdarMode = true;
  public static readonly defaultLanguage = "en";

  public static readonly darkColors = [
    "#802020",
    "#808020",
    "#208020",
    "#208080",
    "#202080",
    "#802080",
  ];

  public static readonly lightColors = [
    "#A02020",
    "#A0A020",
    "#20A020",
    "#20A0A0",
    "#2020A0",
    "#A020A0",
  ];

  private _ownColor = PersistenceService.defaultOwnColor;
  get ownColorIndex() {
    return this._ownColor;
  }
  set ownColorIndex(value: number) {
    this._ownColor = value;
    localStorage.setItem(PersistenceService.ownColorKey, `${value}`);
  }

  private _opponentColor = PersistenceService.defaultOpponentColor;
  get opponentColorIndex() {
    return this._opponentColor;
  }
  set opponentColorIndex(value: number) {
    this._opponentColor = value;
    localStorage.setItem(PersistenceService.opponentColorKey, `${value}`);
  }

  private _neutralColor = PersistenceService.defaultNeutralColor;
  get neutralColorIndex() {
    return this._neutralColor;
  }
  set neutralColorIndex(value: number) {
    this._neutralColor = value;
    localStorage.setItem(PersistenceService.neutralColorKey, `${value}`);
  }

  private _ownSymbol = "";
  get ownSymbol() {
    return this._ownSymbol;
  }
  set ownSymbol(value: string) {
    this._ownSymbol = value;
    localStorage.setItem(PersistenceService.ownSymbolKey, value);
  }

  private _opponentSymbol = "";
  get opponentSymbol() {
    return this._opponentSymbol;
  }
  set opponentSymbol(value: string) {
    this._opponentSymbol = value;
    localStorage.setItem(PersistenceService.opponentSymbolKey, value);
  }

  private _darkMode = true;
  get darkMode() {
    return this._darkMode;
  }
  set darkMode(value: boolean) {
    this._darkMode = value;
    localStorage.setItem(PersistenceService.darkModeKey, `${value}`);
    if (this._darkMode) {
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
    }
  }

  private _language = "en";
  get language() {
    return this._language;
  }
  set language(value: string) {
    this._language = value;
    localStorage.setItem(PersistenceService.languageKey, value);
  }

  constructor() {
    this.ownColorIndex = this.getInt(PersistenceService.ownColorKey, PersistenceService.defaultOwnColor);
    this.opponentColorIndex = this.getInt(PersistenceService.opponentColorKey, PersistenceService.defaultOpponentColor);
    this.neutralColorIndex = this.getInt(PersistenceService.neutralColorKey, PersistenceService.defaultNeutralColor);
    this.ownSymbol = this.getString(PersistenceService.ownSymbolKey, PersistenceService.defaultOwnSymbol);
    this.opponentSymbol = this.getString(PersistenceService.opponentSymbolKey, PersistenceService.defaultOpponentSymbol);
    this.darkMode = this.getBool(PersistenceService.darkModeKey, PersistenceService.defaultdarMode);
    this.language = this.getString(PersistenceService.languageKey, `${PersistenceService.defaultLanguage}`);
  }

  private getString(key: string, initial: string): string {
    const fromSession = localStorage.getItem(key);
    if (fromSession) {
      return fromSession;
    } else {
      return initial;
    }
  }

  private getInt(key: string, initial: number): number {
    const fromSession = localStorage.getItem(key);
    if (fromSession) {
      return parseInt(fromSession);
    } else {
      return initial;
    }
  }

  private getBool(key: string, initial: boolean): boolean {
    const fromSession = localStorage.getItem(key);
    if (fromSession) {
      return fromSession === "true";
    } else {
      return initial;
    }
  }

  public load() {
    // Trick app.component.ts users into thinking the load method actually loads the values when really the constructor of persistence.ts does all the work >:D
  }

  getOwnColor(): string {
    return this.darkMode ? PersistenceService.darkColors[this.ownColorIndex] : PersistenceService.lightColors[this.ownColorIndex];
  }

  getOpponentColor(): string {
    return this.darkMode ? PersistenceService.darkColors[this.opponentColorIndex] : PersistenceService.lightColors[this.opponentColorIndex];
  }

  getNeutralColor(): string {
    return this.darkMode ? PersistenceService.darkColors[this.neutralColorIndex] : PersistenceService.lightColors[this.neutralColorIndex];
  }

  getSoftHighlightColor(): string {
    return this.darkMode ? "#606060" : "#D0D0D0";
  }

  getHarshHighlightColor(): string {
    return this.darkMode ? "#404040" : "#A0A0A0";
  }
}
