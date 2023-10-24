import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models';

const USER_KEY = 'trackit-user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;

  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject(
      JSON.parse(localStorage.getItem(USER_KEY)!)
    );
    this.user = this.userSubject.asObservable();
  }

  public get userValue() {
    return this.userSubject.value;
  }

  public getToken() {
    return JSON.parse(localStorage.getItem(USER_KEY)!).access_token;
  }

  login(username: string, password: string) {
    return this.http.post<User>(`api/users/login`, { username, password }).pipe(
      map((user) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userSubject.next(user);
        return user;
      })
    );
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
