import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { typeOf } from 'maplibre-gl';

export interface DialogData {
  type: string;
  chartData: any[];
}

@Component({
  selector: 'chart-dialog',
  templateUrl: './chart-dialog.component.html',
  styleUrl: './chart-dialog.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    NgxChartsModule,
  ],
})
export class ChartDialog implements OnInit {
  public single: any[] = [];
  public type: string;
  public view: any = [1200, 500];
  public showXAxis = true;
  public showYAxis = true;
  public showLegend!: boolean;
  public showXAxisLabel = true;
  public xAxisLabel!: string;
  public showYAxisLabel = true;
  public yAxisLabel!: string;
  public xAxisTicks!: any[];
  public wrapTicks = true;
  public timeline = true;
  public colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };

  constructor(
    public dialogRef: MatDialogRef<ChartDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.type = data.type;
    this.single = data.chartData;
  }

  ngOnInit(): void {
    if (this.type === 'delay') {
      this.showLegend = false;
      this.xAxisLabel = 'Tempo de retransmissão(s)';
      this.yAxisLabel = '% de recebimento';
      this.xAxisTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    } else if (this.type === 'offline') {
      this.showLegend = true;
      this.showXAxisLabel = false;
      this.yAxisLabel = 'Nº de dispositivos Offline';
    }
  }

  public formatXAxisTicks(value: number): string {
    if (value === 0) return '0s';
    else if (value === 2) return '20s';
    else if (value === 4) return '1m';
    else if (value === 6) return '5m';
    else if (value === 8) return '15m';
    else if (value === 10) return '30m';
    else if (value === 12) return '1h';
    else if (value === 14) return '2h';
    else if (value === 16) return '6h';
    else if (value === 18) return '1d';
    else return '1d+';
  }

  public formatXAxisTicksOfflineChart(value: string) {
    let date = new Date(value);
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
  }

  public formatYAxisTicks(value: number): string {
    return `${value.toString()}%`;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
