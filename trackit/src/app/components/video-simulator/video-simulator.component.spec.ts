import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSimulatorComponent } from './video-simulator.component';

describe('VideoSimulatorComponent', () => {
  let component: VideoSimulatorComponent;
  let fixture: ComponentFixture<VideoSimulatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VideoSimulatorComponent],
    });
    fixture = TestBed.createComponent(VideoSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
