import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { TrackServiceService } from '../../services/track-service.service';
import {
  FileUpload,
  FileUploadEvent,
  FileUploadHandlerEvent,
} from 'primeng/fileupload';
import { ISimulationProperties } from '../simulation-settings/simulation-settings.component';
import { SettingsService } from 'src/app/services/settings.service';
import {
  Observable,
  delay,
  flatMap,
  pipe,
  repeat,
  switchMap,
  takeWhile,
  tap,
  of,
} from 'rxjs';

import { SimulationStatus } from '../../models';

export interface IRectangle {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface IImagePosition {
  x: number;
  y: number;
}

const SIMULATION_STATUS_MAP = new Map<number, string>([
  [1, 'Preparing for simulation'],
  [2, 'Preparing for simulation'],
  [3, 'Simulating'],
  [4, 'Last details...'],
  [5, 'Simulation Finished!'],
  [6, 'On Error'],
]);

@Component({
  selector: 'app-video-simulator',
  templateUrl: './video-simulator.component.html',
  styleUrls: ['./video-simulator.component.scss'],
})
export class VideoSimulatorComponent {
  @ViewChild('canvas') myCanvas!: ElementRef;

  @ViewChild('fileInput') fileInput!: FileUpload;

  @Output() onChangeSimulatingStatus = new EventEmitter<boolean>();

  simulationStatus$!: Observable<any>;
  simulationSettings$!: Observable<ISimulationProperties>;
  simulationSettings!: ISimulationProperties;

  videoFile?: File;

  image: HTMLImageElement = new Image();
  imageSrc?: string;

  chooseLabel = 'Choose';

  firstPosition?: IImagePosition;
  secondPosition?: IImagePosition;
  mousePosition!: IImagePosition;

  isSimulationDone: boolean = false;
  isSimulating: boolean = false;

  imageData!: any;
  rectHeight!: number;
  rectWidth!: number;
  videoHeight!: number;
  videoWidth!: number;
  rectangle?: IRectangle;

  simulationProgress: number = 0;
  currentSimulationStatus?: string = SIMULATION_STATUS_MAP.get(1);

  displayModal: boolean = false;

  drawing = false;

  constructor(
    public service: TrackServiceService,
    public cd: ChangeDetectorRef,
    private settingsService: SettingsService
  ) {
    this.simulationSettings$ = this.settingsService.settings.pipe(
      tap((res) => (this.simulationSettings = res))
    );

    this.simulationStatus$ = of(null).pipe(
      delay(3000),
      // can be used to cancel
      takeWhile(() => this.isSimulating),
      // takeUntil(of(this.isSimulating)),
      flatMap(() => this.service.getSimulationSettings()),
      tap((res) => {
        this.isSimulating = res.status! < 5;
        this.simulationProgress = res.progress!;
        this.currentSimulationStatus = SIMULATION_STATUS_MAP.get(res.status!);
        this.isSimulationDone = res.status == 5;
        if (this.isSimulationDone)
          this.onChangeSimulatingStatus.emit(this.isSimulating);
      }),
      repeat()
    );
  }

  private getCanvasAndContext() {
    const canvas = this.myCanvas?.nativeElement;

    const context = canvas.getContext('2d')!;

    if (canvas.height !== this.videoHeight) {
      canvas.height = this.videoHeight!;
    }
    if (canvas.width !== this.videoWidth) {
      canvas.width = this.videoWidth!;
    }

    context.lineWidth = this.simulationSettings.lineWidth;
    context.strokeStyle = this.simulationSettings.lineColor;
    return { canvas, context };
  }

  downloadVideo() {
    if (!this.isSimulationDone) return;

    this.service.downloadTrackedVideo().subscribe();
  }

  deleteFile() {
    this.videoFile = undefined;
    this.chooseLabel = 'Choose';
    this.imageData = null;
    this.imageSrc = undefined;
    this.isSimulationDone = false;
    this.rectangle = undefined;
    this.fileInput.clear();
  }

  simulateVideo() {
    this.isSimulating = true;
    this.isSimulationDone = false;
    this.onChangeSimulatingStatus.emit(this.isSimulating);
    this.simulationProgress = 0;
    this.currentSimulationStatus = SIMULATION_STATUS_MAP.get(1);
    this.simulationStatus$.subscribe();
    this.service.trackVideo(this.rectangle!).subscribe();
  }

  onGetMousePosition(event: any) {
    const { canvas, context } = this.getCanvasAndContext();

    const cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
    const x = Math.round(event.clientX - cRect.left); // Subtract the 'left' of the canvas
    const y = Math.round(event.clientY - cRect.top); // from the X/Y positions to make

    if (this.firstPosition && !this.secondPosition) {
      context.clearRect(0, 0, this.videoWidth, this.videoHeight);
      context.putImageData(this.imageData, 0, 0);
      this.rectWidth = x - this.firstPosition.x;
      this.rectHeight = y - this.firstPosition.y;

      context.beginPath();
      context.rect(
        this.firstPosition.x,
        this.firstPosition.y,
        this.rectWidth,
        this.rectHeight
      );
      context.stroke();
    }
    this.mousePosition = { x, y } as IImagePosition;
  }

  drawRectangle() {
    const { context } = this.getCanvasAndContext();

    const width = this.secondPosition!.x - this.firstPosition!.x;
    const height = this.secondPosition!.y - this.firstPosition!.y;

    context.beginPath();
    context.rect(this.firstPosition!.x, this.firstPosition!.y, width, height);
    context.stroke();

    this.rectangle = {
      x: this.firstPosition!.x,
      y: this.firstPosition!.y,
      w: width,
      h: height,
    } as IRectangle;
  }

  onDraw() {
    if (this.drawing) {
      this.secondPosition = this.mousePosition;
      this.drawRectangle();
      this.displayModal = false;
    } else {
      this.rectangle = undefined;
      this.secondPosition = undefined;
      this.firstPosition = this.mousePosition;
    }
    this.drawing = !this.drawing;
  }

  onFileChosen(event: FileUploadHandlerEvent) {
    this.videoFile = event.files[0];
    this.chooseLabel = this.videoFile.name;

    this.service.uploadVideo(this.videoFile).subscribe(
      (res) => {
        this.videoMetadataReader(this.videoFile!);
      },
      (err) => console.error(err)
    );
  }

  // Metadata video reader
  videoMetadataReader(buffer: File): void {
    const fileReader = new FileReader();
    const type = this.videoFile!.type;

    fileReader.onload = () => {
      const blob = new Blob([fileReader.result!], { type });
      //
      const url = (URL || webkitURL).createObjectURL(blob);
      const video = document.createElement('video'); // create video element

      video.preload = 'auto'; // preload setting
      video.addEventListener('loadeddata', () => {
        this.videoHeight = video.videoHeight;
        this.videoWidth = video.videoWidth;
        this.getFrame(video);
      });

      video.src = url; // start video load
    };
    fileReader.readAsArrayBuffer(buffer);
  }

  getFrame(videoFile: HTMLVideoElement) {
    const canvas = document.createElement('canvas')!;
    canvas.id = 'temp-canvas';
    canvas.width = this.videoWidth;
    canvas.height = this.videoHeight;
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(canvas);

    // this.cd.detectChanges();

    const mycanvas = document.getElementById(
      'temp-canvas'
    )! as HTMLCanvasElement;
    const context = mycanvas.getContext('2d')!;

    context!.drawImage(videoFile, 0, 0, this.videoWidth, this.videoHeight);

    this.image.src = mycanvas.toDataURL();
    this.imageSrc = this.image.src;

    this.imageData = context.getImageData(
      0,
      0,
      this.videoWidth,
      this.videoHeight
    );
    body.removeChild(mycanvas);
  }

  drawCanvas() {
    this.displayModal = !this.displayModal;

    if (this.displayModal) {
      this.cd.detectChanges();
      const { context } = this.getCanvasAndContext();
      context.putImageData(this.imageData, 0, 0);
    }
  }
}
