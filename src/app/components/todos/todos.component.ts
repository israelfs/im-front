import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent {
  address = [
    {
      id: 1,
      title: 'adrs One',
      completed: false,
    },
    {
      id: 2,
      title: 'adrs Two',
      completed: false,
    },
    {
      id: 3,
      title: 'adrs Three',
      completed: false,
    },
  ];

  inputAddress = '';

  constructor() {}

  ngOnInit() {
    // call api here
  }

  addAddress() {
    this.address.push({
      id: 4,
      title: this.inputAddress,
      completed: false,
    });
    this.inputAddress = '';
  }
}
