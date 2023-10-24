import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription, tap } from 'rxjs';
import { SettingsService } from 'src/app/services/settings.service';

export interface ISimulationProperties {
  buffer: number;
  tracker: string;
  lineWidth: number;
  lineColor: string;
}

@Component({
  selector: 'app-simulation-settings',
  templateUrl: './simulation-settings.component.html',
  styleUrls: ['./simulation-settings.component.scss'],
})
export class SimulationSettingsComponent implements AfterViewInit {
  settings!: ISimulationProperties;
  @Output() onSettingsUpdated = new EventEmitter<ISimulationProperties>();
  @Output() onLogout = new EventEmitter<void>();

  @Input() displayEditor!: boolean;
  @Output() displayEditorChange = new EventEmitter<boolean>();

  formHasChanges = false;

  trackerOptions = [
    { name: 'CSTR', value: 'CSTR' },
    { name: 'MOSSE', value: 'MOSSE' },
    { name: 'BOOSTING', value: 'BOOSTING' },
    { name: 'MIL', value: 'MIL' },
    { name: 'TLD', value: 'TLD' },
    { name: 'MEDIANFLOW', value: 'MEDIANFLOW' },
    { name: 'GOTURN', value: 'GOTURN' },
  ];
  settingsForm!: FormGroup;
  simulationSettings$: Observable<ISimulationProperties>;

  constructor(fb: FormBuilder, private settingsService: SettingsService) {
    this.settingsForm = fb.group({
      buffer: [null],
      tracker: [null],
      lineWidth: [null],
      lineColor: [null],
    });
    this.simulationSettings$ = this.settingsService.settings.pipe(
      tap((res) => {
        this.settings = res;
        this.settingsForm.patchValue(res);
        this.formHasChanges = false;
      })
    );
  }
  ngAfterViewInit() {
    this.settingsForm.valueChanges.subscribe(
      () => (this.formHasChanges = true)
    );
  }

  onCloseSettings(value: boolean) {
    this.displayEditor = value;
    this.displayEditorChange.emit(value);
  }

  logout() {
    this.onLogout.emit();
  }

  onSaveSettings() {
    const settings = { ...this.settingsForm.value } as ISimulationProperties;

    this.onSettingsUpdated.emit(settings);
    this.formHasChanges = false;
  }
}
