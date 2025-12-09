import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServicioService } from '../../../shared/service/servicio.service';
import { ServicioResponse } from '../../../shared/model/servicio-response.model';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent implements OnInit {
  servicios: ServicioResponse[] = [];

  constructor(private servicioService: ServicioService) { }

  ngOnInit(): void {
    this.servicioService.getAllServicios().subscribe(data => {
      this.servicios = data;
    });
  }
}
