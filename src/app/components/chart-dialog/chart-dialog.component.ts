import { Component, Inject, OnInit } from '@angular/core';
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
  typeOfGraph: string;
}

export const single: any[] = [
  {
    name: 'Delays de Retransmissão',
    series: [
      {
        name: '0', // delay de 0 segundos
        value: '56', // 0% das posições são recebidas até 0 segundos
      },
      {
        name: '20', // delay de 20 segundos
        value: '75.54', // Aproximadamente 28.57% das posições são recebidas até 20 segundos
      },
      {
        name: '60', // delay de 60 segundos
        value: '78.54', // Aproximadamente 42.86% das posições são recebidas até 60 segundos
      },
      {
        name: '600', // delay de 600 segundos (10 minutos)
        value: '81.12', // Aproximadamente 57.14% das posições são recebidas até 10 minutos
      },
      {
        name: '3600', // delay de 3600 segundos (1 hora)
        value: '81.43', // Aproximadamente 71.43% das posições são recebidas até 1 hora
      },
      {
        name: '7200', // delay de 7200 segundos (2 horas)
        value: '85.71', // Aproximadamente 85.71% das posições são recebidas até 2 horas
      },
      {
        name: '86400', // delay de 86400 segundos (1 dia)
        value: '86', // 100% das posições são recebidas até 1 dia
      },
    ],
  },
];

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
  single: any[] = [];
  public typeOfGraph: string;
  public view: any = [700, 400];
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend!: boolean;
  public showXAxisLabel = true;
  public xAxisLabel!: string;
  public showYAxisLabel = true;
  public yAxisLabel!: string;
  public graphDataChart: any[] = [];
  public colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };

  constructor(
    public dialogRef: MatDialogRef<ChartDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    Object.assign(this, { single });
    this.typeOfGraph = data.typeOfGraph;
  }

  ngOnInit(): void {
    // fetch data from API
    if (this.data.typeOfGraph === 'delay') {
      this.showLegend = false;
      this.xAxisLabel = 'Tempo de retransmissão(s)';
      this.yAxisLabel = '% de recebimento';
    } else if (this.data.typeOfGraph === 'offline') {
      this.showLegend = true;
      this.xAxisLabel = 'Dia';
      this.yAxisLabel = 'Nº de dispositivos Offline';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
