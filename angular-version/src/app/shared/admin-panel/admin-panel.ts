import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data';
import { Animal } from '../../models/animal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit {
  animalForm: FormGroup;
  mostrarPanel = false;
  nombreArchivoSeleccionado: string = '';

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.animalForm = this.fb.group({
      name: ['', Validators.required],
      breed: ['', Validators.required],
      gender: ['Male', Validators.required],
      description: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      mood: ['', Validators.required],
      weight: ['', Validators.required],
      'hair type': ['', Validators.required],
      images: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  togglePanel() {
    this.mostrarPanel = !this.mostrarPanel;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nombreArchivoSeleccionado = file.name;
      // Simulamos la ruta para que se vea en frontend sin backend real
      this.animalForm.patchValue({ images: '/img/animals/placeholder.jpg' });
    }
  }

  agregarMascota() {
    if (this.animalForm.valid) {
      const formValue = this.animalForm.value;

      const nuevaMascota: Animal = {
        id: Date.now(),
        name: formValue.name,
        breed: formValue.breed,
        gender: formValue.gender,
        description: formValue.description,
        age: Number(formValue.age),
        mood: formValue.mood,
        weight: formValue.weight,
        'hair type': formValue['hair type'],
        clicks: 0,
        images: formValue.images.split(',').map((img: string) => img.trim())
      };

      this.dataService.agregarMascota(nuevaMascota);
      this.animalForm.reset({ gender: 'Male', age: 0 });
      this.nombreArchivoSeleccionado = '';
      this.mostrarPanel = false;
    }
  }
}
