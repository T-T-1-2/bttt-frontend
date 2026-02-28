import { Routes } from "@angular/router";
import { PreparationComponent } from "./preparation/preparation.component";
import { MatchComponent } from "./match/match.component";
import { LandingComponent } from "./landing/landing.component";

export const routes: Routes = [
  { path: "", redirectTo: "/landing", pathMatch: "full" },
  { path: "landing", component: LandingComponent },
  { path: "preparation", component: PreparationComponent },
  { path: "match", component: MatchComponent },
];
