import { TestBed } from '@angular/core/testing';

import { TrackServiceService } from './track-service.service';

describe('TrackServiceService', () => {
  let service: TrackServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
