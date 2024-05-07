import { Component, Inject } from '@angular/core';
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

export interface DialogData {
  animal: string;
  name: string;
}

export const single: any[] = [
  {
    name: 'Karthikeyan',
    series: [
      {
        name: '2016',
        value: '15000',
      },
      {
        name: '2017',
        value: '20000',
      },
      {
        name: '2018',
        value: '25000',
      },
      {
        name: '2019',
        value: '30000',
      },
    ],
  },
  {
    name: 'Gnana Prakasam',
    series: [
      {
        name: '2016',
        value: '4000',
      },
      {
        name: '2017',
        value: '4500',
      },
      {
        name: '2018',
        value: '10000',
      },
      {
        name: '2019',
        value: '15000',
      },
    ],
  },
  {
    name: 'Kumaresan',
    series: [
      {
        name: '2016',
        value: '5000',
      },
      {
        name: '2017',
        value: '8000',
      },
      {
        name: '2018',
        value: '15000',
      },
      {
        name: '2019',
        value: '35000',
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
export class ChartDialog {
  single: any[] = [];
  public view: any = [700, 400];
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = true;
  public showXAxisLabel = true;
  public xAxisLabel = 'Years';
  public showYAxisLabel = true;
  public yAxisLabel = 'Salary';
  public graphDataChart: any[] = [];
  public colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };

  constructor(
    public dialogRef: MatDialogRef<ChartDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    Object.assign(this, { single });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
