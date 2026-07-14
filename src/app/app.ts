import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PortfolioService } from './services/portfolio.service';
import { ResumeData, ContactMessage, Experience, Project } from './models/portfolio.models';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Resume Data State
  protected readonly resumeData = signal<ResumeData | null>(null);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  // Active Skills (flattened list of all unique skills for interactive filtering)
  protected readonly allSkills = computed(() => {
    const data = this.resumeData();
    if (!data || !data.skills) return [];
    return [
      ...data.skills.languages,
      ...data.skills.frontend,
      ...data.skills.backend,
      ...data.skills.databases,
      ...data.skills.tools
    ];
  });

  // Filter Experience by Technology
  protected readonly selectedTech = signal<string | null>(null);
  protected readonly filteredExperience = computed(() => {
    const experiences = this.resumeData()?.experience || [];
    const tech = this.selectedTech();
    
    if (!tech) return experiences;
    
    // Return experiences that have at least one project using this technology
    return experiences.map(exp => {
      const matchingProjects = exp.projects.filter(p => 
        p.technologies.some(t => t.toLowerCase() === tech.toLowerCase())
      );
      return {
        ...exp,
        projects: matchingProjects
      };
    }).filter(exp => exp.projects.length > 0);
  });

  // Contact Form State
  protected contactName = '';
  protected contactEmail = '';
  protected contactSubject = '';
  protected contactMessage = '';
  protected readonly submitting = signal<boolean>(false);
  protected readonly submitSuccess = signal<string | null>(null);
  protected readonly submitError = signal<string | null>(null);

  // Admin Board State
  protected readonly showAdminModal = signal<boolean>(false);
  protected adminPasscode = '';
  protected readonly isAuthorized = signal<boolean>(false);
  protected readonly adminMessages = signal<ContactMessage[]>([]);
  protected readonly adminLoading = signal<boolean>(false);
  protected readonly adminError = signal<string | null>(null);

  // Current year for footer
  protected readonly currentYear = new Date().getFullYear();

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.fetchPortfolioData();
  }

  fetchPortfolioData() {
    this.loading.set(true);
    this.portfolioService.getResume().subscribe({
      next: (data) => {
        this.resumeData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching resume data:', err);
        this.error.set('Failed to load portfolio details. Please check your backend connection.');
        this.loading.set(false);
      }
    });
  }

  // Tech filter methods
  toggleTechFilter(tech: string) {
    if (this.selectedTech() === tech) {
      this.selectedTech.set(null); // Deselect if clicked again
    } else {
      this.selectedTech.set(tech);
    }
    // Scroll to experience section when filter is applied
    const expSec = document.getElementById('experience');
    if (expSec) {
      expSec.scrollIntoView({ behavior: 'smooth' });
    }
  }

  clearTechFilter() {
    this.selectedTech.set(null);
  }

  isTechSelected(tech: string): boolean {
    return this.selectedTech()?.toLowerCase() === tech.toLowerCase();
  }

  // Contact form submission
  onSubmitContact() {
    if (!this.contactName || !this.contactEmail || !this.contactMessage) {
      this.submitError.set('Please fill out all required fields.');
      return;
    }

    this.submitting.set(true);
    this.submitSuccess.set(null);
    this.submitError.set(null);

    const payload: ContactMessage = {
      name: this.contactName,
      email: this.contactEmail,
      subject: this.contactSubject,
      message: this.contactMessage
    };

    this.portfolioService.submitContactMessage(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.submitSuccess.set(res.message || 'Thank you! Your message has been sent successfully.');
          // Reset form fields
          this.contactName = '';
          this.contactEmail = '';
          this.contactSubject = '';
          this.contactMessage = '';
          
          // Clear success message after 5 seconds
          setTimeout(() => this.submitSuccess.set(null), 5000);
        } else {
          this.submitError.set('Something went wrong. Please try again.');
        }
      },
      error: (err) => {
        console.error('Contact submission error:', err);
        this.submitting.set(false);
        this.submitError.set('Could not send message. Please ensure the backend is running.');
      }
    });
  }

  // Admin Methods
  openAdminPanel() {
    this.showAdminModal.set(true);
    this.adminError.set(null);
    // If already authorized, reload messages
    if (this.isAuthorized()) {
      this.loadMessages();
    }
  }

  closeAdminPanel() {
    this.showAdminModal.set(false);
    this.adminPasscode = '';
  }

  verifyPasscode() {
    if (!this.adminPasscode) {
      this.adminError.set('Please enter the passcode.');
      return;
    }

    this.adminLoading.set(true);
    this.adminError.set(null);

    this.portfolioService.getContactMessages(this.adminPasscode).subscribe({
      next: (messages) => {
        this.adminLoading.set(false);
        this.isAuthorized.set(true);
        this.adminMessages.set(messages);
      },
      error: (err) => {
        console.error('Admin authentication failed:', err);
        this.adminLoading.set(false);
        this.adminError.set('Access Denied: Invalid admin passcode.');
      }
    });
  }

  loadMessages() {
    this.adminLoading.set(true);
    this.portfolioService.getContactMessages(this.adminPasscode).subscribe({
      next: (messages) => {
        this.adminLoading.set(false);
        this.adminMessages.set(messages);
      },
      error: (err) => {
        console.error('Error reloading messages:', err);
        this.adminLoading.set(false);
        this.adminError.set('Failed to reload messages.');
      }
    });
  }

  logoutAdmin() {
    this.isAuthorized.set(false);
    this.adminMessages.set([]);
    this.adminPasscode = '';
  }

  // Print / Print Resume helper
  printResume() {
    window.print();
  }
}
