import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-example.component.html',
  styleUrls: ['./code-example.component.css']
})
export class CodeExampleComponent {
  @Input() code!: string;
  @Input() title?: string;
  @Input() showTitle: boolean = true;
  
  copied = false;

  get formattedCode(): string {
    return this.code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }
}