import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent {
  todos = [
    {
      id: 1,
      title: 'Todo One',
      completed: false,
    },
    {
      id: 2,
      title: 'Todo Two',
      completed: false,
    },
    {
      id: 3,
      title: 'Todo Three',
      completed: false,
    },
  ];

  constructor() {}

  ngOnInit() {
    // call api here
  }
}
