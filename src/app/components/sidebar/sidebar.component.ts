import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavItem {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isMenuOpen = false;
  isMobile = false;

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 1024; // lg breakpoint
    if (!this.isMobile) {
      this.isMenuOpen = false; // Reset mobile menu state when switching to desktop
    }
  }
  features: NavItem[] = [
    { id: 'basic-map', label: 'Basic Map' },
    { id: 'markers', label: 'Markers' },
    { id: 'zoom-pan', label: 'Zoom & Pan' },
    { id: 'click-zoom', label: 'Click to Zoom' },
    { id: 'labels', label: 'Country Labels' },
    { id: 'choropleth', label: 'Data Visualization' },
    { id: 'graticule', label: 'Grid Lines' },
    { id: 'projections', label: 'Projections' },
    { id: 'lines', label: 'Lines & Paths' },
    { id: 'annotations', label: 'Annotations' }
  ];

  resources: NavItem[] = [
    { id: 'data-sources', label: 'Data Sources' },
    { id: 'examples', label: 'Examples' },
    { id: 'api', label: 'API Reference' }
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}