import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISimulationProperties } from '../components/simulation-settings/simulation-settings.component';

const SETTINGS_KEY = 'trackit-settings';

const DEFAULT_SETTINGS = {
  buffer: 500,
  tracker: 'CSTR',
  lineWidth: 3,
  lineColor: '#ff0000',
} as ISimulationProperties;

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settingsSubject: BehaviorSubject<ISimulationProperties>;
  public settings: Observable<ISimulationProperties>;

  constructor() {
    let savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)!);

    if (!savedSettings) {
      savedSettings = DEFAULT_SETTINGS;
    }

    this.settingsSubject = new BehaviorSubject(savedSettings);
    this.settings = this.settingsSubject.asObservable();
  }

  getSettings() {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)!);
  }

  saveSettings(settings: ISimulationProperties) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    this.settingsSubject.next(settings);
  }

  resetSettings() {
    this.saveSettings(DEFAULT_SETTINGS);
  }
}
