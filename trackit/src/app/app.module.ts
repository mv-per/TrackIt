import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoSimulatorComponent } from './components/video-simulator/video-simulator.component';
import { ButtonModule } from 'primeng/button';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { SimulationSettingsComponent } from './components/simulation-settings/simulation-settings.component';
import { SidebarModule } from 'primeng/sidebar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { UserService } from './services/user-service.service';
import { LoginComponent } from './components/login/login/login.component';
import { HomeComponent } from './screens/home/home.component';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ProgressBarModule } from 'primeng/progressbar';
// For dynamic progressbar demo
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    AppComponent,
    VideoSimulatorComponent,
    SimulationSettingsComponent,
    LoginComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    BrowserAnimationsModule,
    ButtonModule,
    DialogModule,
    FileUploadModule,
    SidebarModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    InputTextModule,
    PasswordModule,
    TooltipModule,
    SliderModule,
    ColorPickerModule,
    ProgressBarModule,
    ToastModule,
  ],
  providers: [UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
