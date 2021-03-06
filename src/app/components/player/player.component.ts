import { Component, OnInit, Input, OnDestroy } from "@angular/core";

import {
  default as lottie,
  AnimationItem,
  AnimationConfigWithData
} from "node_modules/lottie-web";
import { StateService } from "src/app/services/state.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PlayerService } from "src/app/services/player.service";
import { PropertiesService } from "src/app/services/properties.service";

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
  styleUrls: ["./player.component.scss"]
})
export class PlayerComponent implements OnInit, OnDestroy {
  @Input("isPlaying")
  get isPaused() {
    return false;
    //return this.animation.isPaused;
  }

  animation: AnimationItem | any = null;

  private destroyed$ = new Subject();
  constructor(
    private propertiesService: PropertiesService,
    private stateService: StateService,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    this.loadData(null);
    this.stateService.data.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      this.loadData(p);
    });

    this.propertiesService.сhanged
      .pipe(takeUntil(this.destroyed$))
      .subscribe(p => {
        if (this.animation) {
          this.loadData(this.animation.animationData, true);
        }
      });
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  loadData(data, refresh: boolean = false) {
    if (this.animation) {
      this.animation.destroy();
    }

    if (!data) {
      return;
    }

    let animParams = {
      container: document.getElementById("player") as Element,
      renderer: "svg",
      loop: true,
      prerender: true,
      autoplay: false,
      animationData: data
    } as AnimationConfigWithData;

    this.animation = lottie.loadAnimation(animParams);
    this.playerService.setPlayer(this.animation);
    if (!refresh) {
      this.stateService.onDataParsed(this.animation, animParams.animationData);
    }
  }
}
