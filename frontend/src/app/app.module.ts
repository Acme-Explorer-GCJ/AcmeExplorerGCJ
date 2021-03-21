import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CollapseModule, BsDropdownModule } from 'ngx-bootstrap';
import {AngularFontAwesomeModule} from 'angular-font-awesome';


import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/security/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './components/security/register/register.component';
import { EditProfileComponent } from './components/actor/displayProfile/editProfile.component';
import { AppRoutingModule } from './app-routing.module';
import { ActorService } from './services/actor.service';


export const firebaseConfig = {
  apiKey: 'AIzaSyBvt7OOu0lR6Pi_2qg8XqmsPZLSKdPxwAo',
  authDomain: 'acme-explorer-96392-firebase-adminsdk-utn5s-1b91b25e0d.com',
  databaseURL: 'https://acme-explorer-96392-default-rtdb.firebaseio.com/',
  projectId: 'acme-explorer-96392',
  storageBucket: 'gs://acme-explorer-96392.appspot.com',
  messagingSenderId: '406439947387',
  appId: "1:406439947387:web:c241ce58a40b70cb3e06de"
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    EditProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFontAwesomeModule,
    AngularFireModule.initializeApp(firebaseConfig),
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    HttpClientModule
  ],
  providers: [AngularFireAuth, ActorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
