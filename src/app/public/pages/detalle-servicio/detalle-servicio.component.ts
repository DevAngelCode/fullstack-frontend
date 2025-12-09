import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ServicioService } from '../../../shared/service/servicio.service';
import { ServicioResponse } from '../../../shared/model/servicio-response.model';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/component/navbar/navbar.component';
import { FooterComponent } from '../../../shared/component/footer/footer.component';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { SedeService } from '../../../shared/service/sede.service';
import { SedeResponse } from '../../../shared/model/sede-response.model';

@Component({
  selector: 'app-detalle-servicio',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './detalle-servicio.component.html',
  styleUrl: './detalle-servicio.component.css'
})
export class DetalleServicioComponent implements OnInit {

  servicio: ServicioResponse | null = null;
  sedes: SedeResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private servicioService: ServicioService,
    private sedeService: SedeService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.getServicio(+id);
      }
    });
    this.getSedes();
  }

  getServicio(id: number): void {
    this.servicioService.getServicioById(id).subscribe({
      next: (data) => {
        this.servicio = data;
      },
      error: (err) => {
        console.error('Error al obtener el servicio', err);
      }
    });
  }

  getSedes(): void {
    this.sedeService.getAllSedes().subscribe({
      next: (data) => {
        this.sedes = data;
      },
      error: (err) => {
        console.error('Error al obtener las sedes', err);
      }
    });
  }
}
