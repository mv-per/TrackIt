import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IRectangle } from '../components/video-simulator/video-simulator.component';
import { saveAs } from 'file-saver';
import * as fileSaver from 'file-saver';
import { UserService } from './user-service.service';
import { SettingsService } from './settings.service';
import { SimulationModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TrackServiceService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private settingsService: SettingsService
  ) {}

  uploadVideo(video: any): Observable<void> {
    let formData = new FormData();
    formData.append('file', video, video.name);

    const token = this.userService.getToken();

    const header = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    const request = this.http.post<void>(
      'api/video-track/upload-video/',
      formData,
      { headers: header }
    );
    return request;
  }

  trackVideo(rectangle: IRectangle) {
    const token = this.userService.getToken();

    const settings = this.settingsService.getSettings();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'blob',
        Authorization: 'Bearer ' + token,
      }),
    };

    const request = this.http.post<any>(
      'api/video-track/track-video/',
      { rectangle, settings },
      httpOptions
    );
    return request;
  }

  downloadTrackedVideo() {
    const token = this.userService.getToken();
    const httpOptions: Object = {
      responseType: 'blob',
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      }),
    };
    // const requestOptions: Object = {
    //   /* other options here */
    //   responseType: 'blob',
    // };
    const request = this.http
      .get<any>('api/video-track/download-tracked-video/', httpOptions)
      .pipe(
        tap((response: any) => {
          //when you use stricter type checking
          let blob: any = new Blob([response], {
            type: 'blob',
          });
          const url = window.URL.createObjectURL(blob);
          //window.open(url);
          //window.location.href = response.url;
          fileSaver.saveAs(blob, 'tracked-video.mp4');
        })
      );
    return request;
  }

  getSimulationSettings(): Observable<SimulationModel> {
    const token = this.userService.getToken();
    const httpOptions: Object = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token,
      }),
    };
    // const requestOptions: Object = {
    //   /* other options here */
    //   responseType: 'blob',
    // };
    const request = this.http.get<any>('api/sim-info/', httpOptions);
    return request;
  }
}
