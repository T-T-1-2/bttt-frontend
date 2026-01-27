import { Routes } from "@angular/router";
import { PreparationComponent } from "./preparation/preparation.component";
import { MatchComponent } from "./match/match.component";

export const routes: Routes = [
  { path: "", redirectTo: "/preparation", pathMatch: "full" },
  { path: "preparation", component: PreparationComponent },
  { path: "match", component: MatchComponent },
];
