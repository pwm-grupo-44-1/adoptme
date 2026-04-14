import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MascotasService } from '../../services/MascotasServices';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  mostrarFormulario: boolean = false;
  nombreArchivoSeleccionado: string = '';
  archivoFisico: File | null = null;
  animalForm!: FormGroup;

  constructor(private fb: FormBuilder, private mascotasService: MascotasService) {}

  ngOnInit(): void {
    this.animalForm = this.fb.group({
      nombre: ['', Validators.required],
      genero: ['', Validators.required],
      raza: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]],
      peso: ['', Validators.required],
      pelo: ['', Validators.required],
      caracter: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.animalForm.reset();
      this.resetearArchivo();
    }
  }

  onFileSelected(event: any): void {
    const archivo: File = event.target.files[0];
    if (archivo) {
      this.archivoFisico = archivo;
      this.nombreArchivoSeleccionado = archivo.name;
    }
  }

  resetearArchivo(): void {
    this.archivoFisico = null;
    this.nombreArchivoSeleccionado = '';
  }

  onSubmit(): void {
    if (this.animalForm.valid) {
      const formValues = this.animalForm.value;

      const nuevaMascota = {
        id: Date.now(),
        name: formValues.nombre,
        gender: formValues.genero,
        breed: formValues.raza,
        age: Number(formValues.edad),
        weight: formValues.peso + ' kg',
        "hair type": formValues.pelo,
        mood: formValues.caracter,
        description: formValues.descripcion,
        clicks: 0,
        images: this.nombreArchivoSeleccionado
          ? [`./img/animals/${formValues.nombre}/${this.nombreArchivoSeleccionado}`]
          : ['./img/logo-adoptme.png']
      };
      this.mascotasService.agregarMascota(nuevaMascota);
      this.toggleFormulario();
    }
  }
}
