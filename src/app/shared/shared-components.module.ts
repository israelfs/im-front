import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MapComponent } from '../components/map/map.component';

/**
 * To simplify the import, we will use the NgModule
 * */
@NgModule({
  imports: [MapComponent],
  exports: [MapComponent],
})
export class SharedComponentsModule {}
