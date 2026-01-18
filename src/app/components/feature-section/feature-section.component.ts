import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feature-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-section.component.html',
  styles: [`
   
  `]
})
export class FeatureSectionComponent {
  @Input() id!: string;
  @Input() title!: string;
  @Input() description!: string;
  @Input() highlights?: Array<{title: string, description: string}>;
  @Input() codeExample?: string;
}