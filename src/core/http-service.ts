import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface StartGameResponse {
  code: string;
}

@Injectable({
  providedIn: "root",
})
export class HttpService {

  private baseUrl = "/api"

  constructor(private http: HttpClient) {
  }

  startGame(): Observable<StartGameResponse> {
    return this.http.get(this.baseUrl + "/start") as Observable<StartGameResponse>;
  }

  joinGame(code: string, player: "host" | "guest") {

  }
}
