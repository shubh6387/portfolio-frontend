import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResumeData, ContactMessage } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getResume(): Observable<ResumeData> {
    return this.http.get<ResumeData>(`${this.apiUrl}/resume`);
  }

  submitContactMessage(message: ContactMessage): Observable<{ success: boolean; message: string; data: ContactMessage }> {
    return this.http.post<{ success: boolean; message: string; data: ContactMessage }>(
      `${this.apiUrl}/contact`,
      message
    );
  }

  getContactMessages(passcode: string): Observable<ContactMessage[]> {
    const headers = new HttpHeaders({
      'x-admin-passcode': passcode
    });
    return this.http.get<ContactMessage[]>(`${this.apiUrl}/contact/messages`, { headers });
  }
}
