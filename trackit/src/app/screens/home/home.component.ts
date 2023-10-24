import { Component } from '@angular/core';
import { ISimulationProperties } from 'src/app/components/simulation-settings/simulation-settings.component';
import { SettingsService } from 'src/app/services/settings.service';
import { UserService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(
    private userService: UserService,
    private settingsService: SettingsService
  ) {}

  simulating = false;
  displaySettingsEditor = false;

  updateSimulatingStatus(status: boolean): void {
    this.simulating = status;
  }

  updateSettings(settings: ISimulationProperties) {
    this.settingsService.saveSettings(settings);
  }

  onLogout() {
    this.userService.logout();
  }
}
