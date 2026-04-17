import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { HomeData } from '../../models/data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  homeData: HomeData | null = null;
  paragraphs: string[] = [];
  carouselImages: string[] = [];
  isLoading = true;

  currentIndex = 1;
  activeDotIndex = 0;
  isTransitioning = false;
  transitionStyle = 'transform 0.5s cubic-bezier(.4, 0, .2, 1)';
  autoTimer: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dataService.getHomeData().subscribe({
      next: (data) => {
        this.homeData = data;
        this.setupCarouselAndText();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando los datos del Home:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
    }
  }

  private setupCarouselAndText() {
    if (!this.homeData) return;

    this.paragraphs = (this.homeData.text || '').split('\n\n');
    const imgs = this.homeData.images || [];

    if (imgs.length > 1) {
      this.carouselImages = [imgs[imgs.length - 1], ...imgs, imgs[0]];
      this.currentIndex = 1;
      this.updateActiveDot();
      this.resetAuto();
    } else if (imgs.length === 1) {
      this.carouselImages = [...imgs];
      this.currentIndex = 0;
    }
  }

  prev() { this.goTo(this.currentIndex - 1); }
  next() { this.goTo(this.currentIndex + 1); }
  goToDot(originalIndex: number) { this.goTo(originalIndex + 1); }

  goTo(index: number) {
    if (this.isTransitioning || !this.homeData) return;
    this.isTransitioning = true;
    this.currentIndex = index;
    this.transitionStyle = 'transform 0.5s cubic-bezier(.4, 0, .2, 1)';
    this.updateActiveDot();
    this.resetAuto();
  }

  onTransitionEnd() {
    if (!this.homeData) return;
    this.isTransitioning = false;
    const originalLength = this.homeData.images.length;

    if (this.currentIndex === originalLength + 1) {
      this.transitionStyle = 'none';
      this.currentIndex = 1;
    } else if (this.currentIndex === 0) {
      this.transitionStyle = 'none';
      this.currentIndex = originalLength;
    }
  }

  private updateActiveDot() {
    if (!this.homeData) return;
    const originalLength = this.homeData.images.length;
    let dotIndex = this.currentIndex - 1;

    if (this.currentIndex === originalLength + 1) dotIndex = 0;
    if (this.currentIndex === 0) dotIndex = originalLength - 1;
    this.activeDotIndex = dotIndex;
  }

  private resetAuto() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    this.autoTimer = setInterval(() => this.next(), 4000);
  }
}
